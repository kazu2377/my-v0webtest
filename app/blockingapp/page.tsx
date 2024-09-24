"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function Home() {
  const [baseUrl, setBaseUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const startDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    setTotalFiles(0);
    setCurrentFile("");
    setError("");

    const eventSource = new EventSource(
      `/api/download?baseUrl=${encodeURIComponent(
        baseUrl
      )}&targetUrl=${encodeURIComponent(targetUrl)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "total":
          setTotalFiles(data.count);
          break;
        case "progress":
          setProgress((data.current / data.total) * 100);
          setCurrentFile(
            `${data.fileName} (${(data.fileSize / 1024 / 1024).toFixed(2)} MB)`
          );
          break;
        case "error":
          setError(data.message);
          break;
        case "complete":
          eventSource.close();
          setIsDownloading(false);
          break;
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsDownloading(false);
      setError("An error occurred while downloading files");
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Downloader</h1>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Target URL"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
        <Button
          onClick={startDownload}
          disabled={isDownloading || !baseUrl || !targetUrl}
        >
          {isDownloading ? "Downloading..." : "Start Download"}
        </Button>
      </div>
      {isDownloading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="mt-2">Downloading: {currentFile}</p>
          <p>
            Progress:{" "}
            {totalFiles > 0
              ? `${Math.round(progress)}% (${Math.round(
                  (progress * totalFiles) / 100
                )}/${totalFiles})`
              : "0%"}
          </p>
        </div>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
