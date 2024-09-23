// app/api/download-pdfs/route.ts

import archiver from "archiver";
import * as cheerio from "cheerio"; // 修正ポイント
import fsExtra from "fs-extra";
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import schedule from "node-schedule";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// 一時保存ディレクトリのパス
const TEMP_DIR = path.join(process.cwd(), "public", "temp-archives");

// ディレクトリが存在しない場合は作成
fsExtra.ensureDirSync(TEMP_DIR);

// ユーザーが入力するURLの型
interface DownloadRequestBody {
  baseUrl: string;
  targetUrl: string;
}

export async function POST(request: Request) {
  try {
    const { baseUrl, targetUrl } =
      (await request.json()) as DownloadRequestBody;

    if (!baseUrl || !targetUrl) {
      return NextResponse.json(
        { error: "baseUrl and targetUrl are required" },
        { status: 400 }
      );
    }

    // targetUrlからPDFリンクを抽出
    const pdfUrls = await extractPdfLinks(baseUrl, targetUrl);

    if (pdfUrls.length === 0) {
      return NextResponse.json(
        { error: "No PDF links found at the target URL" },
        { status: 404 }
      );
    }

    // 一意のファイル名を生成
    const archiveId = uuidv4();
    const archiveName = `pdf_files_${archiveId}.zip`;
    const archivePath = path.join(TEMP_DIR, archiveName);

    // ZIPアーカイブの作成
    await createZipArchive(pdfUrls, archivePath);

    // ダウンロードリンクを生成
    const downloadUrl = `/temp-archives/${archiveName}`;

    return NextResponse.json({ downloadUrl }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/download-pdfs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PDFリンクを抽出する関数
async function extractPdfLinks(
  baseUrl: string,
  targetUrl: string
): Promise<string[]> {
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch target URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html); // cheerio.loadがundefinedにならないように修正
    const pdfLinks: string[] = [];

    $('a[href$=".pdf"]').each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        const fullUrl = new URL(href, baseUrl).href;
        pdfLinks.push(fullUrl);
      }
    });

    return pdfLinks;
  } catch (err) {
    console.error("Error extracting PDF links:", err);
    return [];
  }
}

// ZIPアーカイブを作成する関数
async function createZipArchive(pdfUrls: string[], archivePath: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fsExtra.createWriteStream(archivePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 圧縮レベル
    });

    output.on("close", () => {
      console.log(
        `Archive ${archivePath} has been finalized. Total size: ${archive.pointer()} bytes`
      );
      resolve();
    });

    archive.on("error", (err) => {
      console.error("Archiver error:", err);
      reject(err);
    });

    archive.pipe(output);

    // バッチサイズの設定
    const batchSize = 5;
    let currentIndex = 0;

    // PDFをバッチ処理で追加
    (async () => {
      while (currentIndex < pdfUrls.length) {
        const batch = pdfUrls.slice(currentIndex, currentIndex + batchSize);
        currentIndex += batchSize;

        // 各バッチのPDFを並行して処理
        await Promise.all(
          batch.map(async (pdfUrl) => {
            try {
              const response = await fetch(pdfUrl);
              if (!response.ok) {
                console.error(`Failed to download ${pdfUrl}`);
                return;
              }

              const fileName = decodeURIComponent(
                path.basename(new URL(pdfUrl).pathname) || "file.pdf"
              );

              // PDFデータをストリームとしてアーカイブに追加
              archive.append(response.body as NodeJS.ReadableStream, {
                name: fileName,
              });
              console.log(`Added ${fileName} to archive`);
            } catch (err) {
              console.error(`Error processing ${pdfUrl}:`, err);
            }
          })
        );

        console.log(`Processed batch up to index ${currentIndex}`);
      }

      // すべてのファイルを追加し終えたら、アーカイブを終了
      archive.finalize();
      console.log("Archive finalized");

      // ZIPファイル作成後に24時間後に削除するジョブをスケジュール
      const deleteTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

      schedule.scheduleJob(deleteTime, async () => {
        try {
          await fsExtra.unlink(archivePath);
          console.log(`Deleted archive ${archivePath} after 24 hours`);
        } catch (err) {
          console.error(`Failed to delete archive ${archivePath}:`, err);
        }
      });
    })();
  });
}
