// app/page.tsx

"use client";

import { FormEvent, useState } from "react";

const Home: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState<string>("https://jsite.mhlw.go.jp");
  const [targetUrl, setTargetUrl] = useState<string>(
    "https://jsite.mhlw.go.jp/tokyo-roudoukyoku/newpage_00139.html"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleDownload = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseUrl, targetUrl }),
      });

      if (!response.ok) {
        let errorMessage = "ダウンロード中にエラーが発生しました。";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("JSONの解析に失敗しました:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
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
    <div style={styles.container}>
      <h1>PDFダウンローダー</h1>
      <form onSubmit={handleDownload}>
        <div style={styles.formGroup}>
          <label htmlFor="baseUrl">ベースURL:</label>
          <input
            id="baseUrl"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="targetUrl">ターゲットページURL:</label>
          <input
            id="targetUrl"
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "ダウンロード中..." : "ダウンロード"}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    textAlign: "center",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
  formGroup: {
    margin: "20px 0",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};

export default Home;
