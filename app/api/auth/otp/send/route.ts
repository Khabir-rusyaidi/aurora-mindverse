import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supaAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sixDigit() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    // basic env check (helps debug)
    if (!process.env.RESEND_API_KEY) console.error("RESEND_API_KEY is MISSING");
    if (!process.env.EMAIL_FROM) console.error("EMAIL_FROM is MISSING");

    const { email }:{email:string} = await req.json();
    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed) return NextResponse.json({ ok:false, error:"Email required" }, { status:400 });

    // throttle resend: 30s since last send
    const { data: recent } = await supaAdmin
      .from("email_otp")
      .select("*")
      .eq("email", trimmed)
      .eq("purpose", "password_reset")
      .order("created_at", { ascending:false })
      .limit(1)
      .maybeSingle();

    const now = new Date();
    if (recent?.last_sent_at) {
      const delta = now.getTime() - new Date(recent.last_sent_at).getTime();
      if (delta < 30_000) {
        const wait = Math.ceil((30_000 - delta) / 1000);
        return NextResponse.json({ ok:false, error:`Please wait ${wait}s before resending.` }, { status:429 });
      }
    }

    const code = sixDigit();
    const codeHash = await bcrypt.hash(code, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: insErr } = await supaAdmin.from("email_otp").insert({
      email: trimmed,
      purpose: "password_reset",
      code_hash: codeHash,
      expires_at: expires.toISOString(),
      last_sent_at: now.toISOString(),
    });
    if (insErr) return NextResponse.json({ ok:false, error:insErr.message }, { status:500 });

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: trimmed,
      subject: "Your AMV password reset code",
      html: `
        <div style="font-family:system-ui,Segoe UI,Arial">
          <p>Use this code to reset your AMV password:</p>
          <p style="font-size:28px;letter-spacing:4px;"><b>${code}</b></p>
          <p>This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
        </div>`
    });

    if ((result as any)?.error) {
      console.error("Resend error:", (result as any).error);
      return NextResponse.json({ ok:false, error: (result as any).error.message || "Resend failed" }, { status:500 });
    }

    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "Server error" }, { status:500 });
  }
}
