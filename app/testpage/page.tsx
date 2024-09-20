"use client";
import { useEffect, useState } from "react";

// Postの型定義
interface Post {
  title: string;
  body: string;
}

export default function Home() {
  const [post, setPost] = useState<Post | null>(null); // Postかnull
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態
  const [error, setError] = useState<Error | null>(null); // エラーかnull

  useEffect(() => {
    console.log("useEffect called");
    fetch("https://jsonplaceholder.typicode.com/posts/1")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>{post?.title}</h1>
      <p>{post?.body}</p>
    </div>
  );
}
