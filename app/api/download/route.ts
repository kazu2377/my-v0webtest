// app/api/download-pdfs/route.ts

import archiver from "archiver";
import * as cheerio from "cheerio";
import fsExtra from "fs-extra";
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { scheduleJob } from "node-schedule";
import path from "path";
import { Readable } from "stream";
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
        { error: "baseUrlとtargetUrlは必須です" },
        { status: 400 }
      );
    }

    // targetUrlからPDFリンクを抽出
    const pdfUrls = await extractPdfLinks(baseUrl, targetUrl);

    if (pdfUrls.length === 0) {
      return NextResponse.json(
        { error: "対象URLにPDFリンクが見つかりませんでした" },
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
    console.error("/api/download-pdfsでエラーが発生しました:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
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
      throw new Error(`対象URLの取得に失敗しました: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
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
    console.error("PDFリンクの抽出中にエラーが発生しました:", err);
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
        `アーカイブ ${archivePath} が完成しました。合計サイズ: ${archive.pointer()} バイト`
      );
      resolve();
    });

    archive.on("error", (err) => {
      console.error("Archiverエラー:", err);
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
                console.error(`${pdfUrl} のダウンロードに失敗しました`);
                return;
              }

              const fileName = decodeURIComponent(
                path.basename(new URL(pdfUrl).pathname) || "file.pdf"
              );

              if (response.body) {
                // Node.js Readableストリームに変換
                const nodeReadable = Readable.from(response.body as any);
                archive.append(nodeReadable, { name: fileName });
                console.log(`${fileName} をアーカイブに追加しました`);
              } else {
                console.error(`${pdfUrl} のレスポンスにbodyがありません`);
              }
            } catch (err) {
              console.error(`Error processiokng ${pdfUrl}:`, err);
            }
          })
        );

        console.log(`インデックス ${currentIndex} までのバッチを処理しました`);
      }

      // すべてのファイルを追加し終えたら、アーカイブを終了
      archive.finalize();
      console.log("アーカイブが完成しました");

      // ZIPファイル作成後に24時間後に削除するジョブをスケジュール
      const deleteTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

      scheduleJob(deleteTime, async () => {
        try {
          await fsExtra.unlink(archivePath);
          console.log(`24時間後にアーカイブ ${archivePath} を削除しました`);
        } catch (err) {
          console.error(`アーカイブ ${archivePath} の削除に失敗しました:`, err);
        }
      });
    })();
  });
}
