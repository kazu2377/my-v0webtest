import archiver from "archiver";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { PassThrough } from "stream";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { baseUrl, targetUrl } = await req.json();

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    // PDFのURLを抽出
    const pdfUrls: string[] = [];
    $('a[href$=".pdf"]').each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        const url = new URL(href, baseUrl).href;
        pdfUrls.push(url);
      }
    });

    // パススルーストリームを作成
    const stream = new PassThrough();

    // アーカイブを作成し、パススルーストリームにパイプ
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 圧縮レベル
    });

    archive.pipe(stream);

    // エラーハンドリング
    archive.on("error", (err) => {
      console.error("アーカイブエラー:", err);
      stream.destroy(err);
    });

    // レスポンスとしてパススルーストリームを返す
    const responseStream = new Response(stream as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=pdf_files.zip",
      },
    });

    // 非同期でファイルを追加
    (async () => {
      const batchSize = 3;
      for (let i = 0; i < pdfUrls.length; i += batchSize) {
        const batch = pdfUrls.slice(i, i + batchSize);

        // バッチ内の各ファイルをダウンロード
        await Promise.all(
          batch.map(async (pdfUrl) => {
            try {
              const pdfResponse = await fetch(pdfUrl);
              if (!pdfResponse.ok) {
                console.error(`Failed to download ${pdfUrl}`);
                return;
              }

              // PDFをアーカイブに追加
              const fileName = decodeURIComponent(
                pdfUrl.split("/").pop() || "file.pdf"
              );
              archive.append(Buffer.from(await pdfResponse.arrayBuffer()), {
                name: fileName,
              });
            } catch (err) {
              console.error(`Error processing ${pdfUrl}:`, err);
            }
          })
        );
      }

      // すべてのファイルを追加し終えたら、アーカイブを終了
      archive.finalize();
    })();

    // レスポンスを返す
    return responseStream;
  } catch (error: any) {
    console.error("エラー:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
