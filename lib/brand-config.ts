/** Employer brand (header logo, OG alt). */
export const BRAND_EMPLOYER_NAME = "New York Life";

/** Employee-facing portal name (welcome copy, social siteName). */
export const BRAND_PORTAL_NAME = "UPoint";

/** Alight platform name — keep in document `title` and platform references. */
export const BRAND_PLATFORM_NAME = "Alight Worklife";

export const BRAND_SITE_NAME = `${BRAND_EMPLOYER_NAME} ${BRAND_PORTAL_NAME}`;

export const BRAND_LOGO_SRC = "/YourCare-McKesson.svg";
export const BRAND_LOGO_ALT = BRAND_EMPLOYER_NAME;

/** Post-auth redirect and canonical Worklife login URL for this tenant. */
export const ALIGHT_WORKLIFE_LOGIN_URL =
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/newyorklife/login?forkPage=false";

export const METADATA_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || ALIGHT_WORKLIFE_LOGIN_URL;

/** Brand accent from public/YourCareer_Logo.svg */
export const BRAND_THEME_COLOR = "#0072CE";
export const BRAND_BAR_COLOR = "#1e3a5f";

export const AUTH_HERO_IMAGES = ["/image1_name_large.jpg"];

export const METADATA_DESCRIPTION = `Access your ${BRAND_EMPLOYER_NAME} employee benefits through ${BRAND_PORTAL_NAME}, powered by ${BRAND_PLATFORM_NAME}. Sign in to manage benefits, view pay information, and access HR resources.`;

export const OPEN_GRAPH_TITLE = `Login - ${BRAND_EMPLOYER_NAME} ${BRAND_PORTAL_NAME}`;
