import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { OpsVisitorPing } from "@/components/ops-visitor-ping"
import { SeoJsonLd } from "@/components/seo-json-ld"
import "./globals.css"
import {
  ALIGHT_WORKLIFE_LOGIN_URL,
  BRAND_EMPLOYER_NAME,
  BRAND_LOGO_ALT,
  BRAND_LOGO_SRC,
  BRAND_PLATFORM_NAME,
  BRAND_PORTAL_NAME,
  BRAND_THEME_COLOR,
  METADATA_BASE_URL,
  METADATA_DESCRIPTION,
  OPEN_GRAPH_TITLE,
} from "@/lib/brand-config"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: "Alight Worklife",
  description: METADATA_DESCRIPTION,
  keywords: [
    BRAND_EMPLOYER_NAME,
    BRAND_PORTAL_NAME,
    `${BRAND_EMPLOYER_NAME} benefits`,
    `${BRAND_PORTAL_NAME} login`,
    BRAND_PLATFORM_NAME,
    "employee benefits",
    "HR portal",
    "log on",
    "sign in",
    "benefits administration",
    "payroll",
  ],
  authors: [{ name: BRAND_EMPLOYER_NAME }],
  creator: BRAND_EMPLOYER_NAME,
  applicationName: BRAND_EMPLOYER_NAME,
  publisher: "Alight Solutions",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    title: OPEN_GRAPH_TITLE,
    description: METADATA_DESCRIPTION,
    siteName: BRAND_PORTAL_NAME,
    url: METADATA_BASE_URL,
    images: [
      {
        url: BRAND_LOGO_SRC,
        width: 246,
        height: 113,
        alt: BRAND_LOGO_ALT,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: OPEN_GRAPH_TITLE,
    description: METADATA_DESCRIPTION,
    images: [BRAND_LOGO_SRC],
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/favicon-32x32.png",
  },
  themeColor: BRAND_THEME_COLOR,
  category: "Business",
  alternates: {
    canonical: ALIGHT_WORKLIFE_LOGIN_URL,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} font-sans antialiased`}>
        <SeoJsonLd />
        <OpsVisitorPing />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
