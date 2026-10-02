import { PROJECT_DISPLAY_NAME } from "./project-config"

/** Synced for visitor notifications — override NEXT_PUBLIC_SITE_URL in prod. */
export const SITE_DISPLAY_NAME = PROJECT_DISPLAY_NAME

export const SITE_ORIGIN = "https://www.newyork-alightworklife.com" as const

export const SITE_URL = SITE_ORIGIN

export const SITE_SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml` as const

export const SITE_HOMEPAGE_CANONICAL = `${SITE_ORIGIN}/` as const

export const CANONICAL_HOST = new URL(SITE_ORIGIN).hostname

export const INDEXNOW_KEY = "f601a8b071804030afbfc8f971d70156" as const

export function canonicalUrlForPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (path === "/") return SITE_HOMEPAGE_CANONICAL
  return `${SITE_ORIGIN}${path}`
}

export type SitePlatform = "alight" | "wealthcare" | "other"

export const SITE_PLATFORM: SitePlatform | undefined = "alight"

export function detectSitePlatform(): SitePlatform {
  if (SITE_PLATFORM) return SITE_PLATFORM
  const host = new URL(SITE_ORIGIN).hostname.toLowerCase()
  const label = SITE_DISPLAY_NAME.toLowerCase()
  if (/wealthcare|aptia365|flores247|flores/i.test(host + label)) return "wealthcare"
  if (/alight|worklife|work-life|workife/i.test(host + label)) return "alight"
  return "other"
}


export const SOCIAL_PREVIEW_IMAGE = "/og-image.png" as const

export const OG_IMAGE = {
  url: SOCIAL_PREVIEW_IMAGE,
  width: 1200,
  height: 630,
  alt: "Login - Mckesson",
} as const

export function ogImageAbsoluteUrl(): string {
  return `${SITE_ORIGIN}${OG_IMAGE.url}`
}

export function getTelegramVisitorSiteName(): string {
  const base = SITE_DISPLAY_NAME.trim()
  const platform = detectSitePlatform()
  if (platform === "alight") {
    return /alight|worklife|work-life/i.test(base) ? base : `${base} Alight`
  }
  if (platform === "wealthcare") {
    return /wealthcare/i.test(base) ? base : `${base} Wealthcare`
  }
  return base
}
