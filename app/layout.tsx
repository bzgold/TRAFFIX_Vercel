import type React from "react"
import type { Metadata } from "next"
import { Poppins, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TraffixProvider } from "@/lib/traffix-context"
import "./globals.css"

const _poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TRAFFIX - AI-Powered Transportation Analytics",
  description: "Understand why congestion patterns change with AI-powered storytelling for transportation analytics",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <TraffixProvider>
          {children}
          <Analytics />
        </TraffixProvider>
      </body>
    </html>
  )
}
