'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OmikujiResultProps = {
  initialResult: { monster: string; size: number }
  handleOmikuji: () => Promise<{ monster: string; size: number }>
}

export function OmikujiResult({ initialResult, handleOmikuji }: OmikujiResultProps) {
  const [result, setResult] = useState(initialResult)

  const getCrownStatus = (size: number) => {
    if (size >= 0 && size <= 3000) return "最小金冠"
    if (size >= 7000 && size <= 9999) return "最大金冠"
    return ""
  }

  const drawNewOmikuji = async () => {
    const newResult = await handleOmikuji()
    setResult(newResult)
  }

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-center">モンハンキャラおみくじ</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Button onClick={drawNewOmikuji}>おみくじを引くぞ</Button>
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
    </Card>
  )
}