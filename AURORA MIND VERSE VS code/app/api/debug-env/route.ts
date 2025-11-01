import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasResendKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  const hasEmailFrom = Boolean(process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim());
  return NextResponse.json({
    ok: true,
    hasResendKey,
    hasEmailFrom,
    runtime: process.env.VERCEL ? "vercel" : "local",
  });
}
