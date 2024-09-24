"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";

export default function PDFDownloader() {
  const [baseUrl, setBaseUrl] = useState("https://jsite.mhlw.go.jp");
  const [targetUrl, setTargetUrl] = useState(
    "https://jsite.mhlw.go.jp/tokyo-roudoukyoku/newpage_00139.html"
  );
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [downloadedFiles, setDownloadedFiles] = useState<
    { name: string; data: Uint8Array }[]
  >([]);
  const [isComplete, setIsComplete] = useState(false);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    setTotalFiles(0);
    setCurrentFile("");
    setError("");
    setDownloadedFiles([]);
    setIsComplete(false);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const encodedBaseUrl = encodeURIComponent(baseUrl);
    const encodedTargetUrl = encodeURIComponent(targetUrl);
    eventSourceRef.current = new EventSource(
      `/api/download?baseUrl=${encodedBaseUrl}&targetUrl=${encodedTargetUrl}`
    );

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received event:", data);
      switch (data.type) {
        case "total":
          setTotalFiles(data.count);
          break;
        case "progress":
          setProgress((data.current / data.total) * 100);
          setCurrentFile(
            `${data.fileName} (${(data.fileSize / 1024 / 1024).toFixed(2)} MB)`
          );
          if (data.pdfData) {
            setDownloadedFiles((prev) => [
              ...prev,
              { name: data.fileName, data: new Uint8Array(data.pdfData) },
            ]);
          }
          break;
        case "error":
          setError((prev) => prev + "\n" + data.message);
          break;
        case "complete":
          setIsComplete(true);
          setIsDownloading(false);
          closeEventSource();
          console.log(
            "Download complete. Total files:",
            downloadedFiles.length
          );
          break;
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error("EventSource failed:", err);
      setIsDownloading(false);
      setError("An error occurred while downloading files. Please try again.");
      closeEventSource();
    };
  };

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const downloadAllPDFs = async () => {
    try {
      const zip = new JSZip();
      downloadedFiles.forEach((file) => {
        zip.file(file.name, file.data);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = "downloaded_pdfs.zip";
        downloadLinkRef.current.click();
      }
    } catch (error) {
      console.error("Error generating ZIP file:", error);
      setError("Failed to generate ZIP file. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      closeEventSource();
      if (downloadLinkRef.current && downloadLinkRef.current.href) {
        URL.revokeObjectURL(downloadLinkRef.current.href);
      }
    };
  }, []);

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
        <Button onClick={startDownload} disabled={isDownloading}>
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
      {error && (
        <p className="mt-4 text-red-500 whitespace-pre-line">{error}</p>
      )}
      {isComplete && (
        <div className="mt-4">
          <p className="text-green-500 font-bold">Download complete!</p>
          <p>Total files downloaded: {downloadedFiles.length}</p>
          {downloadedFiles.length > 0 && (
            <Button onClick={downloadAllPDFs} className="mt-2">
              Download All PDFs as ZIP
            </Button>
          )}
        </div>
      )}
      <a ref={downloadLinkRef} style={{ display: "none" }} />
    </div>
  );
}
