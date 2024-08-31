'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const monsters = [
  "リオレウス", "ラージャン", "ナルガクルガ", "ティガレックス", "ジンオウガ",
  "ディアブロス", "クシャルダオラ", "テオ・テスカトル", "バルファルク", "マガイマガド"
]

export default function OmikujiPage() {
  const [monster, setMonster] = useState("")
  const [size, setSize] = useState(0)

  const drawOmikuji = () => {
    const randomMonster = monsters[Math.floor(Math.random() * monsters.length)]
    const randomSize = Math.floor(Math.random() * 10000)
    setMonster(randomMonster)
    setSize(randomSize)
  }

  const getCrownStatus = (size: number) => {
    if (size >= 0 && size <= 3000) return "最小金冠"
    if (size >= 7000 && size <= 9999) return "最大金冠"
    return ""
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle className="text-center">モンハンキャラおみくじ</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Button onClick={drawOmikuji}>おみくじを引く</Button>
          {monster && (
            <div className="text-center">
              <p className="text-2xl font-bold">{monster}</p>
              <p className="text-xl">
                サイズ: {size}
                {getCrownStatus(size) && (
                  <span className="ml-2 text-yellow-500">
                    ({getCrownStatus(size)})
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}