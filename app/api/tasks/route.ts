import { NextResponse } from "next/server";

// GETリクエストに対する非同期関数をエクスポート
export async function GET() {
  const encoder = new TextEncoder(); // テキストをエンコードするためのエンコーダーを作成

  // クライアントにデータをストリーミングするためのReadableStreamを作成
  const stream = new ReadableStream({
    async start(controller) {
      // 1から10までのタスクを順次処理
      for (let i = 1; i <= 10; i++) {
        const message = `Task ${i} completed`; // タスク完了メッセージを生成

        // クライアントにデータを送信（エンキュー）
        controller.enqueue(
          encoder.encode(
            // サーバー送信イベント（SSE）の形式でデータを送信
            `data: ${JSON.stringify({ message, progress: i * 10 })}\n\n`
          )
        );

        console.log(message); // サーバー側でログを出力

        // 各タスクの処理時間をシミュレート（1秒待機）
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close(); // 全てのデータ送信が完了したらストリームを閉じる
    },
  });

  // ストリームを含むレスポンスをクライアントに返す
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream", // サーバー送信イベントのコンテンツタイプを指定
      "Cache-Control": "no-cache", // キャッシュを無効化
      Connection: "keep-alive", // 接続を維持してストリーミングを可能にする
    },
  });
}
