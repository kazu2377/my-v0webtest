// app/page.tsx

"use client";

import { useState } from "react";

const DownloadButton = () => {
  const [baseUrl, setBaseUrl] = useState<string>("https://jsite.mhlw.go.jp");
  const [targetUrl, setTargetUrl] = useState<string>(
    "https://jsite.mhlw.go.jp/tokyo-roudoukyoku/newpage_00139.html"
  );
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setDownloadLink(null);

    try {
      const response = await fetch("/api/download", {
        // 正しい相対パスを使用
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseUrl, targetUrl }),
      });

      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create archive");
        }

        setDownloadLink(data.downloadUrl);
      } else {
        // JSON以外のレスポンス（エラーページなど）が返ってきた場合
        const text = await response.text();
        throw new Error("Unexpected response from server: " + text);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PDFダウンロードとZIPアーカイブ作成</h1>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Base URL:
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Target URL:
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{ padding: "10px 20px" }}
      >
        {loading ? "Creating ZIP..." : "Download PDFs as ZIP"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {downloadLink && (
        <div style={{ marginTop: "10px" }}>
          <a href={downloadLink} download>
            Click here to download your ZIP file
          </a>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
