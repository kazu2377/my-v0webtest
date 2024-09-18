// app/api/download/route.ts

// Node.jsランタイムを指定
export const runtime = "nodejs";

import archiver from "archiver";
import axios from "axios";
import * as cheerio from "cheerio"; // 修正済み
import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import { PassThrough } from "stream";
import { v4 as uuidv4 } from "uuid";

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
      return NextResponse.json(
        { message: "許可されていないドメインです。" },
        { status: 400 }
      );
    }

    // ターゲットページの取得
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html); // 修正後

    // すべての<a>タグを取得し、hrefに.pdfが含まれるものを抽出
    let pdfLinks: string[] = [];
    $("a[href]").each((_, elem) => {
      const href = $(elem).attr("href");
      if (href && href.toLowerCase().includes(".pdf")) {
        try {
          const fullUrl = new URL(href, baseUrl).href;
          pdfLinks.push(fullUrl);
        } catch (err) {
          // 無効なURLはスキップ
          console.warn(`無効なURLをスキップしました: ${href}`);
        }
      }
    });

    console.log(`見つかったPDFリンクの数: ${pdfLinks.length}`);

    // 重複を排除
    pdfLinks = Array.from(new Set(pdfLinks));

    if (pdfLinks.length === 0) {
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

    // レスポンスヘッダーを設定してZIPファイルとして送信
    const headers = {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="pdf_files.zip"',
    };

    const stream = new PassThrough();
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 圧縮レベル
    });

    archive.on("error", (err) => {
      console.error("アーカイブエラー:", err);
      throw err;
    });

    // アーカイブをストリームにパイプ
    archive.pipe(stream);

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

    await Promise.all(downloadPromises);

    // アーカイブの完了
    archive.finalize();

    // ストリームをレスポンスとして返す
    return new NextResponse(stream, { headers });
  } catch (err: any) {
    console.error("サーバーエラー:", err);
    return NextResponse.json(
      { message: "サーバー内部でエラーが発生しました。" },
      { status: 500 }
    );
  }
}
