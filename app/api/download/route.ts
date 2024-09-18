// app/api/download/route.ts

export const runtime = "nodejs";

import archiver from "archiver";
import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

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

    // 最大3つのPDFに制限
    const MAX_PDF = 3;
    pdfLinks = pdfLinks.slice(0, MAX_PDF);
    console.log(`処理するPDFの数: ${pdfLinks.length}`);

    // ZIPファイルをストリームとして生成
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 圧縮レベル
    });

    // ストリームを作成
    const stream = new Readable();
    stream._read = () => {}; // 必要に応じて実装

    archive.on("data", (chunk) => {
      stream.push(chunk);
    });

    archive.on("end", () => {
      stream.push(null);
    });

    // PDFのダウンロードとZIPへの追加
    for (const pdfUrl of pdfLinks) {
      try {
        console.log(`PDFをダウンロード中: ${pdfUrl}`);
        const pdfResponse = await axios.get(pdfUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        });

        // ファイル名をURLから取得
        const url = new URL(pdfUrl);
        let fileName = url.pathname.split("/").pop() || "file.pdf";
        fileName = decodeURIComponent(fileName.split("?")[0]); // クエリパラメータを除去

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
    }

    // アーカイブの完了
    console.log("アーカイブを完了します。");
    archive.finalize();

    // ストリーミングレスポンスを返す
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf_files.zip"',
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
