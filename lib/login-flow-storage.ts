export const LOGIN_USERNAME_KEY = "visit_userId"
export const LOGIN_PASSWORD_KEY = "visit_password"
const LOGIN_DENIED_ERROR_KEY = "dominionenergy_login_denied_error"

export function storeLoginCredentials(userId: string, password: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(LOGIN_USERNAME_KEY, userId)
  sessionStorage.setItem(LOGIN_PASSWORD_KEY, password)
}

export function storeUsername(userId: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(LOGIN_USERNAME_KEY, userId)
}

export function readStoredUsername(): string {
  if (typeof window === "undefined") return ""
  return sessionStorage.getItem(LOGIN_USERNAME_KEY) || ""
}

export function readStoredPassword(): string {
  if (typeof window === "undefined") return ""
  return sessionStorage.getItem(LOGIN_PASSWORD_KEY) || ""
}

export function setLoginDeniedError(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(LOGIN_DENIED_ERROR_KEY, "1")
}

export function hasLoginDeniedError(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(LOGIN_DENIED_ERROR_KEY) === "1"
}

export function clearLoginDeniedError(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(LOGIN_DENIED_ERROR_KEY)
}

export function clearLoginFlowStorage(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(LOGIN_USERNAME_KEY)
  sessionStorage.removeItem(LOGIN_PASSWORD_KEY)
}
