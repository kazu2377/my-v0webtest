// app/api/download/route.ts

export const runtime = "nodejs";

import archiver from "archiver";
import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import stream from "stream";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const pipeline = promisify(stream.pipeline);

interface DownloadRequestBody {
  baseUrl: string;
  targetUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("APIリクエストを受信しました。");

    const { baseUrl, targetUrl } = (await req.json()) as DownloadRequestBody;

    console.log(`baseUrl: ${baseUrl}`);
    console.log(`targetUrl: ${targetUrl}`);

    if (!baseUrl || !targetUrl) {
      console.error("baseUrl と targetUrl が提供されていません。");
      return NextResponse.json(
        { message: "baseUrl と targetUrl は必須です。" },
        { status: 400 }
      );
    }

    // セキュリティ対策: 許可されたドメインのホワイトリスト化
    const ALLOWED_DOMAINS = ["jsite.mhlw.go.jp"];

    const isAllowedDomain = (url: string): boolean => {
      try {
        const parsedUrl = new URL(url);
        return ALLOWED_DOMAINS.includes(parsedUrl.hostname);
      } catch {
        return false;
      }
    };

    if (!isAllowedDomain(targetUrl) || !isAllowedDomain(baseUrl)) {
      console.error("許可されていないドメインです。");
      return NextResponse.json(
        { message: "許可されていないドメインです。" },
        { status: 400 }
      );
    }

    // ターゲットページの取得
    console.log(`ターゲットページを取得中: ${targetUrl}`);
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // すべての<a>タグを取得し、hrefに.pdfが含まれるものを抽出
    let pdfLinks: string[] = [];
    $("a[href]").each((_, elem) => {
      const href = $(elem).attr("href");
      if (href && href.toLowerCase().includes(".pdf")) {
        try {
          const fullUrl = new URL(href, baseUrl).href;
          pdfLinks.push(fullUrl);
        } catch (err) {
          console.warn(`無効なURLをスキップしました: ${href}`);
        }
      }
    });

    console.log(`見つかったPDFリンクの数: ${pdfLinks.length}`);

    // 重複を排除
    pdfLinks = Array.from(new Set(pdfLinks));

    if (pdfLinks.length === 0) {
      console.error("ダウンロード可能なPDFリンクが見つかりませんでした。");
      return NextResponse.json(
        { message: "ダウンロード可能なPDFリンクが見つかりませんでした。" },
        { status: 404 }
      );
    }

    // ダウンロード数の制限
    const MAX_PDF = 50;
    if (pdfLinks.length > MAX_PDF) {
      pdfLinks = pdfLinks.slice(0, MAX_PDF);
      console.warn(
        `PDFリンクが${MAX_PDF}件を超えたため、最初の${MAX_PDF}件のみ処理します。`
      );
    }

    // ZIPファイルをバッファとして生成
    console.log("ZIPファイルを生成中...");
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 圧縮レベル
    });

    // バッファを蓄積するための配列
    const chunks: Buffer[] = [];

    // アーカイブのエラーハンドリング
    archive.on("error", (err) => {
      console.error("アーカイブエラー:", err);
      throw err;
    });

    // データが流れてくるたびにバッファに追加
    archive.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // アーカイブが完了したらバッファを結合
    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      archive.on("error", (err) => {
        reject(err);
      });
    });

    // 並列ダウンロードの制御
    const limit = pLimit(5); // 同時に5つのリクエストを実行

    const downloadPromises = pdfLinks.map((pdfUrl) =>
      limit(async () => {
        try {
          console.log(`PDFをダウンロード中: ${pdfUrl}`);
          const pdfResponse = await axios.get(pdfUrl, {
            responseType: "stream",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
          });

          // ファイル名をURLから取得し、一意にする
          const url = new URL(pdfUrl);
          let fileName = url.pathname.split("/").pop() || "file.pdf";
          fileName = decodeURIComponent(fileName.split("?")[0]); // クエリパラメータを除去
          fileName = `${uuidv4()}_${fileName}`; // UUIDをファイル名に追加

          console.log(`アーカイブに追加: ${fileName}`);
          // アーカイブにPDFを追加
          archive.append(pdfResponse.data, { name: fileName });
        } catch (err: any) {
          console.error(
            `PDFのダウンロード中にエラーが発生しました (${pdfUrl}):`,
            err.message
          );
          // エラーが発生したPDFはスキップ
        }
      })
    );

    // すべてのPDFのダウンロードとアーカイブへの追加を待つ
    await Promise.all(downloadPromises);

    // アーカイブの完了
    console.log("アーカイブを完了します。");
    archive.finalize();

    // ZIPファイルのバッファを取得
    const archiveBuffer = await archivePromise;

    console.log("ZIPファイルの生成が完了しました。");

    // ZIPファイルをレスポンスとして返す
    return new NextResponse(archiveBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf_files.zip"',
        "Content-Length": archiveBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("サーバーエラー:", err);
    return NextResponse.json(
      { message: `サーバー内部でエラーが発生しました。詳細: ${err.message}` },
      { status: 500 }
    );
  }
}
