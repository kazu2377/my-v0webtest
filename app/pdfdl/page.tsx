"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

export default function Home() {
  const [baseUrl, setBaseUrl] = useState<string>("https://jsite.mhlw.go.jp");
  const [targetUrl, setTargetUrl] = useState<string>(
    "https://jsite.mhlw.go.jp/tokyo-roudoukyoku/newpage_00139.html"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const handleDownload = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseUrl, targetUrl }),
      });

      if (!response.ok) {
        throw new Error("ダウンロード中にエラーが発生しました。");
      }

      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get("Content-Length") ?? "0");
      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        setProgress((receivedLength / contentLength) * 100);
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pdf_files.zip");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      setError(err.message);
      console.error("ダウンロードエラー:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">PDFダウンローダー</h1>
      <form onSubmit={handleDownload} className="space-y-4">
        <div>
          <label
            htmlFor="baseUrl"
            className="block text-sm font-medium text-gray-700"
          >
            ベースURL:
          </label>
          <Input
            id="baseUrl"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="targetUrl"
            className="block text-sm font-medium text-gray-700"
          >
            ターゲットページURL：
          </label>
          <Input
            id="targetUrl"
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "ダウンロード中..." : "ダウンロード"}
        </Button>
      </form>
      {loading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2">
            {progress.toFixed(2)}% ダウンロード完了
          </p>
        </div>
      )}
    </div>
  );
}
