import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supaAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, code, newPassword }:
      { email:string; code:string; newPassword:string } = await req.json();

    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed || !code || !newPassword)
      return NextResponse.json({ ok:false, error:"Missing fields" }, { status:400 });
    if (newPassword.length < 8)
      return NextResponse.json({ ok:false, error:"Password must be at least 8 characters" }, { status:400 });

    const { data: row, error } = await supaAdmin
      .from("email_otp")
      .select("*")
      .eq("email", trimmed)
      .eq("purpose", "password_reset")
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) return NextResponse.json({ ok:false, error:"Invalid or expired code" }, { status:400 });

    const now = new Date();
    if (new Date(row.expires_at).getTime() < now.getTime())
      return NextResponse.json({ ok:false, error:"Code expired" }, { status:400 });
    if (row.attempts >= 5)
      return NextResponse.json({ ok:false, error:"Too many attempts" }, { status:429 });

    const match = await bcrypt.compare(code, row.code_hash);
    if (!match) {
      await supaAdmin.from("email_otp").update({ attempts: row.attempts + 1 }).eq("id", row.id);
      return NextResponse.json({ ok:false, error:"Incorrect code" }, { status:400 });
    }

    // find user by email
    const { data: userRes, error: getErr } = await supaAdmin.auth.admin.getUserByEmail(trimmed);
    if (getErr || !userRes?.user)
      return NextResponse.json({ ok:false, error:"User not found" }, { status:404 });

    const userId = userRes.user.id;

    // update password (old password becomes invalid)
    const { error: updErr } = await supaAdmin.auth.admin.updateUserById(userId, { password: newPassword });
    if (updErr) return NextResponse.json({ ok:false, error: updErr.message }, { status:500 });

    // mark this and other codes as used
    await supaAdmin.from("email_otp").update({ used: true }).eq("id", row.id);
    await supaAdmin.from("email_otp")
      .update({ used: true })
      .eq("email", trimmed)
      .eq("purpose", "password_reset")
      .neq("id", row.id);

    return NextResponse.json({ ok:true, message:"Password updated" });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "Server error" }, { status:500 });
  }
}
