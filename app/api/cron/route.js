import { settle } from '@/lib/plan';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('forbidden', { status: 401 });
  const notes = await settle();
  for (const t of notes)
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.ALLOWED_CHAT_ID, text: t }),
    });
  return Response.json({ ok: true, settled: notes.length });
}
