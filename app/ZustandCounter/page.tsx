import Counter from "./Counter";
import DisplayCount from "./DisplayCount";

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Zustand Persist and Global State Example
      </h1>
      <Counter />
      <DisplayCount />
    </div>
  );
}
