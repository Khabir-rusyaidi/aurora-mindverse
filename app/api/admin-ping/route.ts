import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  return NextResponse.json({ ok: true, message: 'API is connected!' });
}
