import { BRAND_EMPLOYER_NAME, BRAND_PORTAL_NAME, METADATA_DESCRIPTION } from "@/lib/brand-config"
import { SITE_HOMEPAGE_CANONICAL, SITE_ORIGIN, ogImageAbsoluteUrl } from "@/lib/site-url"

/**
 * JSON-LD structured data for SEO (WebSite + Organization).
 * Rendered in root layout for search engines.
 */
export function SeoJsonLd() {
  const siteName = `${BRAND_EMPLOYER_NAME} ${BRAND_PORTAL_NAME}`

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: [`${BRAND_PORTAL_NAME} login`, `${BRAND_EMPLOYER_NAME} benefits login`],
    description: METADATA_DESCRIPTION,
    url: SITE_HOMEPAGE_CANONICAL,
    publisher: {
      "@type": "Organization",
      name: BRAND_EMPLOYER_NAME,
      url: SITE_ORIGIN,
    },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "LoginAction",
      target: {
        "@type": "EntryPoint",
        url: SITE_HOMEPAGE_CANONICAL,
      },
      name: `${siteName} Login`,
    },
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_EMPLOYER_NAME,
    url: SITE_ORIGIN,
    logo: ogImageAbsoluteUrl(),
    description: METADATA_DESCRIPTION,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteName,
        item: SITE_HOMEPAGE_CANONICAL,
      },
    ],
  }

  const combined = [websiteSchema, organizationSchema, breadcrumbSchema]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combined) }}
    />
  )
}
