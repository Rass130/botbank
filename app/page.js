import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, rp, wib, summary } from '@/lib/db';
import { token } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const SIGN = { income: ['+', 'in'], expense: ['-', 'out'], saving_in: ['→🐷', 'sv'], saving_out: ['🐷→', 'sv'], transfer: ['⇄', 'sv'] };
const W = { cash: '💵 cash', bank: '🏦 bank' };

export default async function Home() {
  if (cookies().get('fb')?.value !== token()) redirect('/login');

  const s = await summary();
  const { data } = await db.from('transactions').select('*').order('id', { ascending: false }).limit(300);
  const rows = data || [];
  const month = wib().slice(0, 7);
  const thisMonth = rows.filter((r) => wib(r.created_at).startsWith(month));
  const sum = (ty) => thisMonth.filter((r) => r.type === ty).reduce((a, r) => a + r.amount, 0);

  const cats = {};
  thisMonth.filter((r) => r.type === 'expense').forEach((r) => (cats[r.category] = (cats[r.category] || 0) + r.amount));
  const catList = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const max = catList[0]?.[1] || 1;

  return (
    <main>
      <h1>Catatan Keuangan</h1>
      <div className="pan hero">
        <small>Total saldo</small>
        <div className={'num' + (s.balance < 0 ? ' neg' : '')}>{rp(s.balance)}</div>
      </div>
      {s.balance <= 50000 && <div className="say">Awas! Saldo tinggal tipis, hemat dulu sampai ada pemasukan lagi.</div>}

      <div className="grid">
        <div className="pan cash"><small>💵 Cash</small><div className="num">{rp(s.cash)}</div></div>
        <div className="pan bank"><small>🏦 Bank</small><div className="num">{rp(s.bank)}</div></div>
        <div className="pan sav wide"><small>🐷 Tabungan</small><div className="num">{rp(s.saving)}</div></div>
        <div className="pan"><small>Masuk bulan ini</small><div className="num in">{rp(sum('income'))}</div></div>
        <div className="pan"><small>Keluar bulan ini</small><div className="num out">{rp(sum('expense'))}</div></div>
      </div>

      <h2>Jajan ke mana aja?</h2>
      <div className="pan">
        {catList.length === 0 && <span className="m">Belum ada pengeluaran bulan ini.</span>}
        {catList.map(([c, v]) => (
          <div className="bar" key={c}>
            <span>{c}</span><i style={{ width: Math.max(8, (v / max) * 100) + '%' }} /><span style={{ textAlign: 'right' }}>{rp(v)}</span>
          </div>
        ))}
      </div>

      <h2>Transaksi terakhir</h2>
      {rows.length === 0 && <div className="pan m">Kirim pesan ke bot, misalnya: beli bakso 20k</div>}
      {rows.map((r) => (
        <div className="pan tx" key={r.id}>
          <div>
            <b>{r.note}</b>
            <span className="m"><span className="tag">{r.type === 'transfer' ? `${r.wallet} → ${r.to_wallet}` : W[r.wallet]}</span>{r.category} · {wib(r.created_at).slice(5, 16)}</span>
          </div>
          <div className={'amt ' + SIGN[r.type][1]}>{SIGN[r.type][0]} {rp(r.amount)}</div>
        </div>
      ))}
    </main>
  );
}
