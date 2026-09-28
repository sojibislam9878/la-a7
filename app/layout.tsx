import type { Metadata } from "next"
import { Fraunces, Geist, Geist_Mono } from "next/font/google"

import { Providers } from "@/components/providers/providers"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["SOFT", "opsz"] })

export const metadata: Metadata = {
  title: {
    default: "AgroStore — Cold Storage Booking for Farmers",
    template: "%s | AgroStore",
  },
  description:
    "Find, book and pay for refrigerated cold storage capacity by the kilogram across Bangladesh.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <body className="min-h-svh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
