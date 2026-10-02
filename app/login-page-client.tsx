"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AuthPageLayout } from "@/components/auth/auth-page-layout"
import { UserIdStep } from "@/components/auth/user-id-step"
import {
  MSG_INCORRECT_USERNAME_PASSWORD,
  MSG_UNABLE_VERIFY_TIME,
} from "@/lib/approval-messages"
import { AUTH_HERO_IMAGES } from "@/lib/brand-config"
import {
  clearLoginDeniedError,
  clearLoginFlowStorage,
  hasLoginDeniedError,
} from "@/lib/login-flow-storage"

const heroImages = AUTH_HERO_IMAGES

export function LoginPageClient() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [formMessage, setFormMessage] = useState<string | null>(null)

  const heroSrc = useMemo(
    () => heroImages[Math.floor(Math.random() * heroImages.length)],
    [],
  )

  const applyLoginLanding = useCallback(() => {
    const loginDenied =
      searchParams.get("loginDenied") === "1" ||
      searchParams.get("denied") === "1" ||
      hasLoginDeniedError()
    const verifyUnavailable = searchParams.get("verifyUnavailable") === "1"

    clearLoginFlowStorage()
    clearLoginDeniedError()

    if (verifyUnavailable) {
      setFormMessage(MSG_UNABLE_VERIFY_TIME)
    } else if (loginDenied) {
      setFormMessage(MSG_INCORRECT_USERNAME_PASSWORD)
    } else {
      setFormMessage(null)
    }
  }, [searchParams])

  useEffect(() => {
    if (pathname !== "/") return
    applyLoginLanding()
  }, [pathname, applyLoginLanding])

  return (
    <AuthPageLayout heroSrc={heroSrc}>
      <UserIdStep formMessage={formMessage} />
    </AuthPageLayout>
  )
}
