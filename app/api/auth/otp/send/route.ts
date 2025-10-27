import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // avoid static optimization

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars missing");
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { email, code, newPassword }:
      { email: string; code: string; newPassword: string } = await req.json();

    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed || !code || !newPassword)
      return NextResponse.json({ ok:false, error:"Missing fields" }, { status:400 });
    if (newPassword.length < 8)
      return NextResponse.json({ ok:false, error:"Password must be at least 8 characters" }, { status:400 });

    // lazily create admin client at runtime (prevents build-time crash)
    const supaAdmin = getAdmin();

    // latest unused OTP
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

    // find user by email via listUsers (admin v2)
    const { data: usersData, error: listErr } = await supaAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) return NextResponse.json({ ok:false, error:listErr.message }, { status:500 });

    const user = usersData.users.find(u => (u.email || "").toLowerCase() === trimmed);
    if (!user) return NextResponse.json({ ok:false, error:"User not found" }, { status:404 });

    // update password
    const { error: updErr } = await supaAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updErr) return NextResponse.json({ ok:false, error:updErr.message }, { status:500 });

    // mark codes used
    await supaAdmin.from("email_otp").update({ used: true }).eq("id", row.id);
    await supaAdmin.from("email_otp")
      .update({ used: true })
      .eq("email", trimmed)
      .eq("purpose", "password_reset")
      .neq("id", row.id);

    return NextResponse.json({ ok:true, message:"Password updated" });
  } catch (e:any) {
    // if envs missing during runtime, surface a clear error
    return NextResponse.json({ ok:false, error: e?.message || "Server error" }, { status:500 });
  }
}
