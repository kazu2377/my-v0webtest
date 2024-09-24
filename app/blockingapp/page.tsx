"use client"; // クライアントサイドでのレンダリングを有効化

import { Button } from "@/components/ui/button"; // ボタンコンポーネントをインポート
import { Progress } from "@/components/ui/progress"; // プログレスバーコンポーネントをインポート

import { useEffect, useState } from "react"; // Reactのフックをインポート

export default function Home() {
  // メッセージの配列を管理するステート
  const [messages, setMessages] = useState<string[]>([]);
  // プログレスバーの進捗を管理するステート
  const [progress, setProgress] = useState(0);
  // タスクが実行中かどうかを管理するステート
  const [isRunning, setIsRunning] = useState(false);

  // タスクの実行を開始する関数
  const startTasks = () => {
    setIsRunning(true); // タスク実行中フラグを立てる
    setMessages([]); // メッセージリストをリセット
    setProgress(0); // プログレスをリセット

    // サーバーからのイベントを受信するためのEventSourceを作成
    const eventSource = new EventSource("/api/tasks");

    // サーバーからメッセージを受信したときの処理
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data); // 受信データをパース
      setMessages((prevMessages) => [...prevMessages, data.message]); // メッセージを追加
      console.log(data.progress); // デバッグ用のログ出力
      setProgress(data.progress); // プログレスを更新
    };

    // エラーが発生したときの処理
    eventSource.onerror = () => {
      eventSource.close(); // EventSourceを閉じる
      setIsRunning(false); // タスク実行中フラグを下ろす
    };
  };

  // コンポーネントのクリーンアップ処理
  useEffect(() => {
    return () => {
      if (isRunning) {
        // タスク実行中であればEventSourceを閉じる
        const eventSource = new EventSource("/api/tasks");
        eventSource.close();
      }
    };
  }, [isRunning]);

  return (
    <div className="container mx-auto p-4">
      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-4">Non-Blocking Task Execution</h1>
      {/* タスク開始ボタン */}
      <Button onClick={startTasks} disabled={isRunning}>
        {isRunning ? "Running..." : "Start Tasks"}
      </Button>
      {/* プログレスバー */}
      <div className="mt-4">
        <Progress value={progress} />
      </div>
      {/* メッセージのリスト表示 */}
      <ul className="mt-4 space-y-2">
        {messages.map((message, index) => (
          <li key={index} className="bg-gray-100 p-2 rounded">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
