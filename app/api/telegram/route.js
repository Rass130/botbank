import { db, rp, wib, summary } from '@/lib/db';
import { parse } from '@/lib/parse';

const LOW = 50000;
const LABEL = { income: '💰 Pemasukan', expense: '🛒 Pengeluaran', saving_in: '🐷 Masuk tabungan', saving_out: '🏧 Ambil tabungan' };
const HELP = `Ketik transaksi biasa:
• beli bakso 20k
• gajian 2jt
• jual hp 500rb
• tabung 300k
• ambil tabungan 100k

Perintah: /saldo /hari /bulan /undo`;

export async function POST(req) {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== process.env.TELEGRAM_SECRET)
    return new Response('forbidden', { status: 401 });
  const msg = (await req.json()).message;
  if (!msg?.text) return Response.json({ ok: true });

  const chat = msg.chat.id;
  const text = msg.text.trim();
  const send = (t) =>
    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: t }),
    });

  try {
    if (String(chat) !== process.env.ALLOWED_CHAT_ID) {
      await send(`Chat ID kamu: ${chat}\nIsi ke ALLOWED_CHAT_ID di Vercel, lalu redeploy.`);
      return Response.json({ ok: true });
    }
    const cmd = text.split(/[\s@]/)[0].toLowerCase();

    if (cmd === '/start' || cmd === '/help') await send(HELP);
    else if (cmd === '/saldo') {
      const s = await summary();
      await send(`💳 Saldo: ${rp(s.balance)}\n🐷 Tabungan: ${rp(s.saving)}`);
    } else if (cmd === '/hari' || cmd === '/bulan') {
      const w = wib();
      const from = cmd === '/hari' ? w.slice(0, 10) : w.slice(0, 7) + '-01';
      const { data } = await db.from('transactions').select('type,amount').gte('created_at', new Date(from + 'T00:00:00+07:00').toISOString());
      const sum = (ty) => (data || []).filter((r) => r.type === ty).reduce((a, r) => a + r.amount, 0);
      await send(`${cmd === '/hari' ? 'Hari ini' : 'Bulan ini'}\nMasuk: ${rp(sum('income'))}\nKeluar: ${rp(sum('expense'))}`);
    } else if (cmd === '/undo') {
      const { data } = await db.from('transactions').select('*').order('id', { ascending: false }).limit(1);
      if (!data?.length) await send('Belum ada transaksi.');
      else {
        await db.from('transactions').delete().eq('id', data[0].id);
        await send(`↩️ Dihapus: ${data[0].note} (${rp(data[0].amount)})`);
      }
    } else {
      const tx = parse(text);
      if (!tx) await send('Aku gak nemu nominalnya. Contoh: beli bakso 20k\n\n' + HELP);
      else {
        const s = await summary();
        if ((tx.type === 'expense' || tx.type === 'saving_in') && tx.amount > s.balance)
          await send(`⛔ Ditolak, saldo gak cukup.\nSaldo: ${rp(s.balance)}, butuh ${rp(tx.amount)}.`);
        else if (tx.type === 'saving_out' && tx.amount > s.saving)
          await send(`⛔ Tabungan gak cukup. Tabungan: ${rp(s.saving)}.`);
        else {
          await db.from('transactions').insert(tx);
          const s2 = await summary();
          let r = `${LABEL[tx.type]} ${rp(tx.amount)} (${tx.category})\nSaldo: ${rp(s2.balance)} | Tabungan: ${rp(s2.saving)}`;
          if (s2.balance <= LOW)
            r += `\n\n⚠️ Saldo tinggal ${rp(s2.balance)}! Hemat dulu sampai ada pemasukan lagi.`;
          await send(r);
        }
      }
    }
  } catch (e) {
    await send('❌ Error: ' + e.message);
  }
  return Response.json({ ok: true });
}
