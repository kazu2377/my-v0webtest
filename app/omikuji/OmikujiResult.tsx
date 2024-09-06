"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { handleGreeting } from "./actions";

type OmikujiResultProps = {
  initialResult: { monster: string; size: number };
  handleOmikuji: () => Promise<{ monster: string; size: number }>;
  handleServerAction: () => Promise<void>;
};

export function OmikujiResult({
  initialResult,
  handleOmikuji,
  handleServerAction,
}: OmikujiResultProps) {
  const [result, setResult] = useState(initialResult);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [first, setfirst] = useState<string>("");

  console.log("最初");

  const getCrownStatus = (size: number) => {
    if (size >= 0 && size <= 3000) return "最小金冠";
    if (size >= 7000 && size <= 9999) return "最大金冠";
    return "";
  };

  const drawNewOmikuji = async () => {
    const newResult = await handleOmikuji();
    setResult(newResult);
  };

  const testServerAction = async () => {
    const newResult = await handleServerAction();
  };

  async function onSubmit(formData: FormData) {
    const result = await handleGreeting(formData);
    console.log("3");

    setGreeting(result);
  }

  useEffect(() => {
    console.log("2");
  }, [greeting]); // searchTermが変更されたときに効果を再実行

  return (
    <Card className="w-[300px]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>挨拶フォーム</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div>
              <Input type="text" name="name" placeholder="お名前" required />
            </div>
            <Button type="submit">送信</Button>
            {console.log("1")}
            {greeting && <p className="mt-4 text-center">{greeting}</p>}
            {/* {first && <p className="mt-4 text-center">{first}</p>} */}
          </form>
        </CardContent>
      </Card>
    </Card>
  );
}
