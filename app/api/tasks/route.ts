import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 10; i++) {
        const message = `Task ${i} completed`;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ message, progress: i * 10 })}\n\n`
          )
        );
        console.log(message);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 各タスクに1秒かかると仮定
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
