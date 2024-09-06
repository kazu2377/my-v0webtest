"use client";

import { Button } from "@/components/ui/button";
import { useCounterStore } from "./store";

export default function Counter() {
  const { count, increment, decrement } = useCounterStore();

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">Counter Component</h2>
      <p className="text-4xl">{count}</p>
      <div className="flex space-x-2">
        <Button onClick={decrement}>-</Button>
        <Button onClick={increment}>+</Button>
      </div>
    </div>
  );
}
