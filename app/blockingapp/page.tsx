"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/Progress";

import { useEffect, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTasks = () => {
    setIsRunning(true);
    setMessages([]);
    setProgress(0);

    const eventSource = new EventSource("/api/tasks");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
      console.log(data.progress);
      setProgress(data.progress);
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsRunning(false);
    };
  };

  useEffect(() => {
    return () => {
      if (isRunning) {
        const eventSource = new EventSource("/api/tasks");
        eventSource.close();
      }
    };
  }, [isRunning]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Non-Blocking Task Execution</h1>
      <Button onClick={startTasks} disabled={isRunning}>
        {isRunning ? "Running..." : "Start Tasks"}
      </Button>
      <div className="mt-4">
        <Progress value={progress} />
      </div>
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
