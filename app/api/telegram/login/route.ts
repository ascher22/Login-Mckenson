import { NextRequest, NextResponse } from "next/server"

const FLOW_MAX_AGE_SEC = 10 * 60

/** Sets login_flow cookie after password step; notification is sent via /api/telegram/input. */
export async function POST(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.set("login_flow", "1", {
      path: "/",
      maxAge: FLOW_MAX_AGE_SEC,
      sameSite: "lax",
    })
    return response
  } catch (error) {
    console.error("Error setting login flow cookie:", error)
    return NextResponse.json({ error: "Failed to complete login step" }, { status: 500 })
  }
}
