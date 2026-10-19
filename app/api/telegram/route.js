import { db, rp, wib, summary } from '@/lib/db';
import { parse, lastAmount } from '@/lib/parse';
import { jatah, settle, propose, propText, propKb, decide } from '@/lib/plan';

const LOW = 50000;
const LABEL = { income: '💰 Pemasukan', expense: '🛒 Pengeluaran', saving_in: '🐷 Masuk tabungan', saving_out: '🏧 Ambil tabungan', transfer: '🔁 Pindah saldo' };
const HELP = `Catat transaksi:
• beli bakso 20k (tanpa "tf" = cash)
• beli bakso 20k tf (bank)
• gajian 300k → bot kasih usulan bagi, tinggal ACC
• tabung 300k / ambil tabungan 100k
• tarik tunai 200k / setor 200k

Target beli:
• target sepatu 500k
• target sepatu 500k https://link-barang
• /target (lihat progress), hapus target 2

Lainnya: /saldo /jatah /hari /bulan /undo`;

export async function POST(req) {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== process.env.TELEGRAM_SECRET)
    return new Response('forbidden', { status: 401 });
  const u = await req.json();
  const cb = u.callback_query;
  const msg = cb ? cb.message : u.message;
  if (!msg) return Response.json({ ok: true });

  const chat = msg.chat.id;
  const tg = (m, b) =>
    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/${m}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b),
    });
  const send = (t, extra = {}) => tg('sendMessage', { chat_id: chat, text: t, ...extra });

  try {
    if (String(chat) !== process.env.ALLOWED_CHAT_ID) {
      if (!cb) await send(`Chat ID kamu: ${chat}\nIsi ke ALLOWED_CHAT_ID di Vercel, lalu redeploy.`);
      return Response.json({ ok: true });
    }

    if (cb) {
      const [, id, part] = cb.data.split(':');
      const r = await decide(+id, part);
      await tg('answerCallbackQuery', { callback_query_id: cb.id, text: r.err || 'Oke!' });
      if (!r.err) {
        await tg('editMessageText', { chat_id: chat, message_id: msg.message_id, text: propText(r.p), reply_markup: { inline_keyboard: propKb(r.p) } });
        if (r.notes.length) await send(r.notes.join('\n'));
      }
      return Response.json({ ok: true });
    }

    const text = msg.text?.trim();
    if (!text) return Response.json({ ok: true });
    for (const n of await settle()) await send(n);

    const low = text.toLowerCase();
    const cmd = low.split(/[\s@]/)[0];

    if (cmd === '/start' || cmd === '/help') await send(HELP);
    else if (cmd === '/saldo') {
      const s = await summary();
      await send(`💳 Total: ${rp(s.balance)}\n💵 Cash: ${rp(s.cash)}\n🏦 Bank: ${rp(s.bank)}\n🐷 Tabungan: ${rp(s.saving)}`);
    } else if (cmd === '/jatah') {
      const j = await jatah();
      await send(j.budget ? `🍜 Jatah jajan minggu ini: ${rp(j.budget)}\nTerpakai: ${rp(j.spent)}\nSisa: ${rp(j.budget - j.spent)}` : 'Belum ada jatah jajan minggu ini. Nanti muncul setelah lu ACC usulan pemasukan.');
    } else if (cmd === '/target') {
      const { data } = await db.from('targets').select('*').eq('status', 'active').order('id');
      await send(data?.length ? '🎯 Target:\n' + data.map((t) => `#${t.id} ${t.name}: ${rp(t.saved)}/${rp(t.price)} (${Math.round((t.saved / t.price) * 100)}%)`).join('\n') : 'Belum ada target. Contoh: target sepatu 500k');
    } else if (/^hapus target \d+/.test(low)) {
      const { data: t } = await db.from('targets').select('*').eq('id', +low.match(/\d+/)[0]).maybeSingle();
      if (!t) await send('Target gak ketemu.');
      else if (t.saved > 0) await send(`Target ini sudah terisi ${rp(t.saved)}, belum bisa dihapus.`);
      else { await db.from('targets').update({ status: 'cancelled' }).eq('id', t.id); await send('🗑️ Target dihapus.'); }
    } else if (low.startsWith('target') || /https?:\/\//.test(low)) {
      const link = text.match(/https?:\/\/\S+/)?.[0] || null;
      const rest = text.replace(link || '', '').replace(/^\s*(tambah\s+)?target/i, '').trim();
      const a = lastAmount(rest);
      if (!a) await send('Harganya berapa? Contoh: target sepatu 500k https://link-barang');
      else {
        const name = rest.replace(a.raw, '').replace(/\s+/g, ' ').trim() || 'barang';
        await db.from('targets').insert({ name, price: a.n, link });
        await send(`🎯 Target dibuat: ${name} (${rp(a.n)}). Dana masuk lewat usulan bagi pemasukan.`);
      }
    } else if (cmd === '/hari' || cmd === '/bulan') {
      const w = wib();
      const from = cmd === '/hari' ? w.slice(0, 10) : w.slice(0, 7) + '-01';
      const { data } = await db.from('transactions').select('type,amount').gte('created_at', new Date(from + 'T00:00:00+07:00').toISOString());
      const sum = (ty) => (data || []).filter((r) => r.type === ty).reduce((a, r) => a + r.amount, 0);
      await send(`${cmd === '/hari' ? 'Hari ini' : 'Bulan ini'}\nMasuk: ${rp(sum('income'))}\nKeluar: ${rp(sum('expense'))}`);
    } else if (cmd === '/undo') {
      const { data } = await db.from('transactions').select('*').order('id', { ascending: false }).limit(1);
      if (!data?.length) await send('Belum ada transaksi.');
      else if (data[0].category === 'target') await send('Transaksi pengisian target gak bisa di-undo.');
      else {
        await db.from('transactions').delete().eq('id', data[0].id);
        await send(`↩️ Dihapus: ${data[0].note} (${rp(data[0].amount)})`);
      }
    } else {
      const tx = parse(text);
      if (!tx) await send('Aku gak nemu nominalnya. Contoh: beli bakso 20k\n\n' + HELP);
      else {
        const s = await summary();
        if (tx.type !== 'income' && tx.type !== 'saving_out' && tx.amount > s[tx.wallet])
          await send(`⛔ Ditolak, saldo ${tx.wallet} gak cukup.\nSaldo ${tx.wallet}: ${rp(s[tx.wallet])}, butuh ${rp(tx.amount)}.`);
        else if (tx.type === 'saving_out' && tx.amount > s.saving)
          await send(`⛔ Tabungan gak cukup. Tabungan: ${rp(s.saving)}.`);
        else {
          await db.from('transactions').insert(tx);
          const s2 = await summary();
          let r = `${LABEL[tx.type]} ${rp(tx.amount)} (${tx.category}, ${tx.type === 'transfer' ? tx.wallet + ' → ' + tx.to_wallet : tx.wallet})\nTotal: ${rp(s2.balance)}\n💵 ${rp(s2.cash)} | 🏦 ${rp(s2.bank)} | 🐷 ${rp(s2.saving)}`;
          if (tx.type === 'expense' && tx.category !== 'tagihan') {
            const j = await jatah();
            if (j.budget > 0) {
              const sisa = j.budget - j.spent;
              r += sisa >= 0 ? `\n🍜 Sisa jatah jajan minggu ini: ${rp(sisa)}` + (sisa <= j.budget * 0.2 ? ' ⚠️ hampir habis' : '') : `\n🍜 Jatah jajan minggu ini kelewat ${rp(-sisa)}!`;
            }
          }
          if (s2.balance <= LOW) r += `\n\n⚠️ Saldo tinggal ${rp(s2.balance)}! Hemat dulu sampai ada pemasukan lagi.`;
          await send(r);
          if (tx.type === 'income' && tx.amount >= 20000) {
            const p = await propose(tx);
            await send(propText(p), { reply_markup: { inline_keyboard: propKb(p) } });
          }
        }
      }
    }
  } catch (e) {
    await send('❌ Error: ' + e.message);
  }
  return Response.json({ ok: true });
}
