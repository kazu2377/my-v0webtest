'use client'

import { Phone, Mail, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Header section */}
      <header className="bg-[#FFA500] text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">EOSファーム</div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="#" className="hover:underline">ホーム</a></li>
                <li><a href="#" className="hover:underline">事業内容</a></li>
                <li><a href="#" className="hover:underline">会社概要</a></li>
                <li><a href="#" className="hover:underline">お問い合わせ</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-r from-[#FFA500] to-[#FFD700] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">未来の農業を創造する</h1>
            <p className="text-xl mb-8">EOSファームは、最先端のテクノロジーと伝統的な農業の知恵を融合させ、持続可能な食糧生産の未来を切り開きます。</p>
            <Button className="bg-white text-[#FFA500] hover:bg-gray-100">
              詳細を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Business Content Section */}
      <section className="relative bg-gray-100 py-16">
        {/* Round shape background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient id="gradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#FFA500" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gradient2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g>
              <circle cx="10" cy="10" r="20" fill="url(#gradient1)">
                <animateMotion
                  path="M 0 0 Q 50 50 100 0 Q 50 -50 0 0"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g>
              <circle cx="90" cy="90" r="20" fill="url(#gradient2)">
                <animateMotion
                  path="M 100 100 Q 50 50 0 100 Q 50 150 100 100"
                  dur="25s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-yellow-400 rounded-full mr-3"></div>
            <h2 className="text-3xl font-bold">Business</h2>
          </div>
          <h3 className="text-2xl font-semibold mb-8">EOSファームの事業内容</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>スマート農業ソリューション</CardTitle>
              </CardHeader>
              <CardContent>
                <p>IoTセンサーとAIを活用した農業管理システムを提供し、効率的な栽培と収穫を実現します。</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>有機農産物の生産・販売</CardTitle>
              </CardHeader>
              <CardContent>
                <p>化学肥料や農薬を使用せず、環境に配慮した有機農法で高品質な農産物を生産・販売しています。</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>農業コンサルティング</CardTitle>
              </CardHeader>
              <CardContent>
                <p>長年の経験と最新の技術知識を活かし、農業経営の効率化や収益向上のアドバイスを提供します。</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>農業体験プログラム</CardTitle>
              </CardHeader>
              <CardContent>
                <p>都市部の方々に農業の魅力を伝えるため、収穫体験や農業教室などのプログラムを実施しています。</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">お問い合わせ</h2>
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-[#FFA500]" />
                  <span>0120-123-456</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-[#FFA500]" />
                  <span>info@eosfarm.jp</span>
                </div>
                <Button className="w-full bg-[#FFA500] hover:bg-[#FFD700]">
                  お問い合わせフォーム
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">EOSファーム</h3>
              <p>〒123-4567 東京都新宿区西新宿1-2-3</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">リンク</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">ホーム</a></li>
                <li><a href="#" className="hover:underline">事業内容</a></li>
                <li><a href="#" className="hover:underline">会社概要</a></li>
                <li><a href="#" className="hover:underline">お問い合わせ</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">ソーシャルメディア</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-[#FFA500]">
                  <svg
                    className=" h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#FFA500]">
                  <svg
                    className=" h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#FFA500]">
                  <svg
                    className=" h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}