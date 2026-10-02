import { NextResponse } from "next/server";
import { getPendingLogin } from "@/lib/pending-logins";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Pending login ID is required" },
      { status: 400 },
    );
  }

  const pendingLogin = await getPendingLogin(id);
  if (!pendingLogin) {
    return NextResponse.json(
      { error: "Pending login not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: pendingLogin.id,
    status: pendingLogin.status,
  });
}
