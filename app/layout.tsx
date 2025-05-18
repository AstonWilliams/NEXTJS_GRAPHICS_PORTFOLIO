import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import StarfieldBackground from "@/components/starfield-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DesignSpace | Creative Portfolio",
  description: "A showcase of innovative graphic design work across typography, print, and digital media.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <StarfieldBackground />
        <Navbar />
        <div className="pt-20">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
