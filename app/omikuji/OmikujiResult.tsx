"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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
    console.log(result);
    setGreeting(result);
  }

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-center">モンハンキャラおみくじ</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Button onClick={drawNewOmikuji}>おみくじを引くぞ</Button>
        <Button onClick={testServerAction}>
          サーバーアクションテストするぞ
        </Button>
        <div className="text-center">
          <p className="text-2xl font-bold">{result.monster}</p>
          <p className="text-xl">
            サイズ: {result.size}
            {getCrownStatus(result.size) && (
              <span className="ml-2 text-yellow-500">
                ({getCrownStatus(result.size)})
              </span>
            )}
          </p>
        </div>
      </CardContent>

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
            {greeting && <p className="mt-4 text-center">{greeting}</p>}
          </form>
        </CardContent>
      </Card>
    </Card>
  );
}
