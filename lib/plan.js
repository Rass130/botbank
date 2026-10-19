import { db, rp, wib, summary } from './db';

const FREE = ['tagihan']; // kategori yang tidak memotong jatah jajan
const addDays = (w, n) => { const t = new Date(w + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const iso = (w) => new Date(w + 'T00:00:00+07:00').toISOString();

export const weekStart = (d = new Date()) => {
  const t = new Date(wib(d).slice(0, 10) + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
};

export async function weekSpent(w) {
  const { data } = await db.from('transactions').select('amount,category').eq('type', 'expense')
    .gte('created_at', iso(w)).lt('created_at', iso(addDays(w, 7)));
  return (data || []).filter((r) => !FREE.includes(r.category)).reduce((a, r) => a + r.amount, 0);
}

export async function jatah() {
  const week = weekStart();
  const { data } = await db.from('allowance').select('budget').eq('week', week).maybeSingle();
  return { week, budget: data?.budget || 0, spent: await weekSpent(week) };
}

export async function fundTargets(amount, wallet, note) {
  const { data } = await db.from('targets').select('*').eq('status', 'active').order('id');
  let left = amount;
  const out = [];
  for (const t of data || []) {
    if (left <= 0) break;
    const put = Math.min(left, t.price - t.saved);
    if (put <= 0) continue;
    await db.from('transactions').insert({ type: 'target_in', wallet, amount: put, category: 'target', note: `${note}: ${t.name}` });
    const saved = t.saved + put;
    await db.from('targets').update({ saved, status: saved >= t.price ? 'done' : 'active' }).eq('id', t.id);
    out.push(`🎯 ${t.name} +${rp(put)} ` + (saved >= t.price ? '(TERCAPAI! 🎉)' : `(${rp(saved)}/${rp(t.price)})`));
    left -= put;
  }
  if (left > 0) {
    await db.from('transactions').insert({ type: 'saving_in', wallet, amount: left, category: 'tabungan', note: `${note} (sisa ke tabungan)` });
    out.push(`🐷 ${rp(left)} masuk tabungan (gak ada target aktif yang butuh)`);
  }
  return out;
}

export async function settle() {
  const { data } = await db.from('allowance').select('*').eq('settled', false).lt('week', weekStart());
  const out = [];
  for (const a of data || []) {
    await db.from('allowance').update({ settled: true }).eq('week', a.week);
    const left = a.budget - (await weekSpent(a.week));
    if (left <= 0) { out.push(`🍜 Jatah jajan minggu ${a.week} habis, gak ada sisa buat target.`); continue; }
    const s = await summary();
    const wallet = s.cash >= s.bank ? 'cash' : 'bank';
    const amt = Math.min(left, s[wallet]);
    if (amt <= 0) continue;
    out.push(`🍜 Sisa jajan minggu lalu ${rp(amt)} dipindah ke target:\n` + (await fundTargets(amt, wallet, 'sisa jajan')).join('\n'));
  }
  return out;
}

export async function propose(tx) {
  const { data } = await db.from('targets').select('price,saved').eq('status', 'active');
  const need = (data || []).reduce((a, t) => a + t.price - t.saved, 0);
  const r = (n) => Math.round(n / 1000) * 1000;
  const jajan = r(tx.amount * 0.3);
  const tgt = Math.min(r(tx.amount * 0.45), need);
  const tab = tx.amount - jajan - tgt;
  const st = (n) => (n > 0 ? 'pending' : 'skip');
  const { data: p } = await db.from('proposals')
    .insert({ wallet: tx.wallet, amount: tx.amount, tab, tgt, jajan, tab_s: st(tab), tgt_s: st(tgt), jj_s: st(jajan) })
    .select().single();
  return p;
}

const ICON = { pending: '⏳', done: '✅', skip: '❌' };
export const propText = (p) =>
  `📊 Usulan bagi pemasukan ${rp(p.amount)}:\n${ICON[p.tab_s]} 🐷 Tabungan ${rp(p.tab)}\n${ICON[p.tgt_s]} 🎯 Target ${rp(p.tgt)}\n${ICON[p.jj_s]} 🍜 Jajan minggu ini ${rp(p.jajan)}`;

export const propKb = (p) => {
  const b = [['tab', '🐷 Tabungan', p.tab_s], ['tgt', '🎯 Target', p.tgt_s], ['jj', '🍜 Jajan', p.jj_s]]
    .filter((x) => x[2] === 'pending')
    .map((x) => ({ text: '✅ ' + x[1], callback_data: `p:${p.id}:${x[0]}` }));
  if (!b.length) return [];
  return [b.slice(0, 2), b.slice(2), [{ text: '✅ ACC semua', callback_data: `p:${p.id}:all` }, { text: '❌ Skip semua', callback_data: `p:${p.id}:no` }]].filter((r) => r.length);
};

export async function decide(id, part) {
  const { data: p } = await db.from('proposals').select('*').eq('id', id).maybeSingle();
  if (!p) return { err: 'Usulan gak ketemu.' };
  const parts = part === 'all' || part === 'no' ? ['tab', 'tgt', 'jj'] : [part];
  const notes = [];
  for (const k of parts) {
    const col = k + '_s';
    const amt = { tab: p.tab, tgt: p.tgt, jj: p.jajan }[k];
    if (p[col] !== 'pending') continue;
    if (part === 'no') { p[col] = 'skip'; continue; }
    if (k !== 'jj') {
      const s = await summary();
      if (amt > s[p.wallet]) { notes.push(`⛔ Saldo ${p.wallet} kurang buat bagian ini.`); continue; }
    }
    if (k === 'tab') await db.from('transactions').insert({ type: 'saving_in', wallet: p.wallet, amount: amt, category: 'tabungan', note: 'alokasi pemasukan' });
    if (k === 'tgt') notes.push(...(await fundTargets(amt, p.wallet, 'alokasi')));
    if (k === 'jj') {
      const w = weekStart();
      const { data: a } = await db.from('allowance').select('budget').eq('week', w).maybeSingle();
      await db.from('allowance').upsert({ week: w, budget: (a?.budget || 0) + amt });
    }
    p[col] = 'done';
  }
  await db.from('proposals').update({ tab_s: p.tab_s, tgt_s: p.tgt_s, jj_s: p.jj_s }).eq('id', id);
  return { p, notes };
}
