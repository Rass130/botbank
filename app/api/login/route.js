import { NextResponse } from 'next/server';
import { token } from '@/lib/auth';

export async function POST(req) {
  const pw = (await req.formData()).get('password');
  const ok = pw === process.env.DASHBOARD_PASSWORD;
  const res = NextResponse.redirect(new URL(ok ? '/' : '/login?salah=1', req.url), 303);
  if (ok) res.cookies.set('fb', token(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 2592000 });
  return res;
}
