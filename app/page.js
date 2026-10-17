import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, rp, wib, summary } from '@/lib/db';
import { token } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const SIGN = { income: '+', expense: '-', saving_in: '→🐷', saving_out: '🐷→', transfer: '⇄' };

export default async function Home() {
  if (cookies().get('fb')?.value !== token()) redirect('/login');

  const s = await summary();
  const { data } = await db.from('transactions').select('*').order('id', { ascending: false }).limit(300);
  const rows = data || [];
  const now = wib();
  const thisMonth = rows.filter((r) => wib(r.created_at).startsWith(now.slice(0, 7)));
  const sum = (ty) => thisMonth.filter((r) => r.type === ty).reduce((a, r) => a + r.amount, 0);

  const cats = {};
  thisMonth.filter((r) => r.type === 'expense').forEach((r) => (cats[r.category] = (cats[r.category] || 0) + r.amount));
  const catList = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const max = catList[0]?.[1] || 1;
  const low = s.balance <= 50000;

  return (
    <main>
      <span className="ch">Chapter {now.slice(5, 7)}</span>
      <h1>Catatan Keuangan</h1>

      <div className="panels">
        <div className="p s6 hero">
          <small>Total saldo</small>
          <div className={'disp' + (s.balance < 0 ? ' neg' : '')}>{rp(s.balance)}</div>
          <span className="sfx">{low ? 'ゴゴゴ' : 'ドン!'}</span>
        </div>
        <div className="p s3"><small>💵 Cash</small><div className="disp">{rp(s.cash)}</div></div>
        <div className="p s3"><small>🏦 Bank</small><div className="disp">{rp(s.bank)}</div></div>
        <div className="p s6 hatch"><small>🐷 Tabungan</small><div className="disp">{rp(s.saving)}</div></div>
        <div className="p s3"><small>Masuk bulan ini</small><div className="disp">{rp(sum('income'))}</div></div>
        <div className="p s3"><small>Keluar bulan ini</small><div className="disp neg">{rp(sum('expense'))}</div></div>
      </div>
      {low && <div className="say"><b>GAWAT!</b>Saldo tinggal tipis. Hemat dulu sampai ada pemasukan lagi.</div>}

      <h2>Uang lari ke mana?</h2>
      <div className="p">
        {catList.length === 0 && <span className="m">Belum ada pengeluaran bulan ini.</span>}
        {catList.map(([c, v]) => (
          <div className="bar" key={c}>
            <span>{c}</span><i style={{ width: Math.max(8, (v / max) * 100) + '%' }} /><span style={{ textAlign: 'right' }}>{rp(v)}</span>
          </div>
        ))}
      </div>

      <h2>Riwayat</h2>
      {rows.length === 0 && <div className="p m">Kirim pesan ke bot, misalnya: beli bakso 20k</div>}
      {rows.map((r) => {
        const t = wib(r.created_at);
        return (
          <div className="tx" key={r.id}>
            <time>{t.slice(8, 10)}/{t.slice(5, 7)}<br />{t.slice(11, 16)}</time>
            <div>
              <b>{r.note}</b>
              <span className="m">
                <span className={'tag' + (r.wallet === 'bank' ? ' k' : '')}>{r.type === 'transfer' ? `${r.wallet}→${r.to_wallet}` : r.wallet}</span>
                {r.category}
              </span>
            </div>
            <div className={'amt' + (r.type === 'expense' ? ' out' : '')}>{SIGN[r.type]} {rp(r.amount)}</div>
          </div>
        );
      })}
    </main>
  );
}
