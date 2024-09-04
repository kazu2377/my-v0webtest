import { OmikujiResult } from "./OmikujiResult";
import { handleServerAction } from "./actions";
const monsters = [
  "リオレウス",
  "ラージャン",
  "ナルガクルガ",
  "ティガレックス",
  "ジンオウガ",
  "ディアブロス",
  "クシャルダオラ",
  "テオ・テスカトル",
  "バルファルク",
  "マガイマガド",
];

function drawOmikuji() {
  console.log("drawOmikuji");
  const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
  const randomSize = Math.floor(Math.random() * 10000);
  return { monster: randomMonster, size: randomSize };
}

export default function OmikujiPage() {
  const initialResult = drawOmikuji();

  async function handleOmikuji() {
    "use server";
    console.log("use serverサーバーサイド");
    return drawOmikuji();
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <OmikujiResult
        initialResult={initialResult}
        handleOmikuji={handleOmikuji}
        handleServerAction={handleServerAction}
      />
    </div>
  );
}
