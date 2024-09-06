"use client";

import { useCounterStore } from "./store";

export default function DisplayCount() {
  const count = useCounterStore((state) => state.count);

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-semibold">Display Count Component</h2>
      <p>Current count: {count}</p>
    </div>
  );
}
