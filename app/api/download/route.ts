import * as cheerio from "cheerio";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const { searchParams } = new URL(req.url);
  const baseUrl = searchParams.get("baseUrl");
  const targetUrl = searchParams.get("targetUrl");

  if (!baseUrl || !targetUrl) {
    return new Response("Missing baseUrl or targetUrl", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(targetUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        const pdfUrls: string[] = [];
        $('a[href$=".pdf"]').each((_, element) => {
          const href = $(element).attr("href");
          if (href) {
            const url = new URL(href, baseUrl).href;
            pdfUrls.push(url);
          }
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "total",
              count: pdfUrls.length,
            })}\n\n`
          )
        );

        for (let i = 0; i < pdfUrls.length; i++) {
          const pdfUrl = pdfUrls[i];
          try {
            const pdfResponse = await fetch(pdfUrl);
            if (!pdfResponse.ok) {
              throw new Error(`Failed to download ${pdfUrl}`);
            }

            const fileName = decodeURIComponent(
              pdfUrl.split("/").pop() || "file.pdf"
            );
            const fileSize = parseInt(
              pdfResponse.headers.get("content-length") || "0",
              10
            );
            const pdfData = await pdfResponse.arrayBuffer();

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  current: i + 1,
                  total: pdfUrls.length,
                  fileName,
                  fileSize,
                  pdfData: Array.from(new Uint8Array(pdfData)),
                })}\n\n`
              )
            );
          } catch (err) {
            console.error(`Error processing ${pdfUrl}:`, err);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: `Failed to download ${pdfUrl}`,
                })}\n\n`
              )
            );
          }

          // Add a small delay to prevent overwhelming the stream
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Ensure the complete message is sent
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "complete" })}\n\n`)
        );
      } catch (error) {
        console.error("Error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: "An error occurred during the download process",
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
