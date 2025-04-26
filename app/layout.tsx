import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProvidersWrapper } from "./providers-wrapper" // <--- new client component

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CarMarket - Намери перфектната кола",
  description: "Разгледай и продавай автомобили на нашия надежден пазар",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <ProvidersWrapper>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ProvidersWrapper>
      </body>
    </html>
  )
}
