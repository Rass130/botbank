import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, wib, summary } from '@/lib/db';
import { token } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const ICON = { makan: '🍜', transport: '🛵', tagihan: '🧾', belanja: '🛍️', hiburan: '🎮', pemasukan: '💰', tabungan: '🐷', pindah: '🔁', lainnya: '📦' };
const COLS = ['var(--r)', 'var(--b)', 'var(--pu)', 'var(--p)', 'var(--g)'];
const SIGN = { income: '+', expense: '-', saving_in: '→🐷', saving_out: '🐷→', transfer: '⇄' };
const rp = (n) => {
  const t = (v) => String(+v.toFixed(2)).replace('.', ',');
  const a = Math.abs(n), sg = n < 0 ? '-' : '';
  return sg + 'Rp' + (a >= 1e6 ? t(a / 1e6) + 'jt' : a >= 1e3 ? t(a / 1e3) + 'rb' : String(a));
};

export default async function Home() {
  if (cookies().get('fb')?.value !== token()) redirect('/login');

  const s = await summary();
  const { data } = await db.from('transactions').select('*').order('id', { ascending: false }).limit(300);
  const rows = data || [];
  const day = (ms = 0) => wib(Date.now() - ms).slice(0, 10);
  const today = day(), yday = day(864e5), now = wib();
  const monthRows = rows.filter((r) => wib(r.created_at).startsWith(now.slice(0, 7)));
  const sum = (ty) => monthRows.filter((r) => r.type === ty).reduce((a, r) => a + r.amount, 0);

  const left = new Date(+now.slice(0, 4), +now.slice(5, 7), 0).getDate() - +now.slice(8, 10) + 1;
  const daily = Math.max(0, Math.floor(s.balance / left / 1000) * 1000);
  const low = s.balance <= 50000;

  const week = [6, 5, 4, 3, 2, 1, 0].map((i) => {
    const k = day(i * 864e5);
    const v = rows.filter((r) => r.type === 'expense' && wib(r.created_at).slice(0, 10) === k).reduce((a, r) => a + r.amount, 0);
    return { k, v };
  });
  const wmax = Math.max(...week.map((w) => w.v), 1);

  const cats = {};
  monthRows.filter((r) => r.type === 'expense').forEach((r) => (cats[r.category] = (cats[r.category] || 0) + r.amount));
  const catList = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const cmax = catList[0]?.[1] || 1;

  const groups = [];
  rows.forEach((r) => {
    const k = wib(r.created_at).slice(0, 10);
    let g = groups[groups.length - 1];
    if (!g || g.k !== k) groups.push((g = { k, items: [] }));
    g.items.push(r);
  });
  const label = (k) => (k === today ? 'HARI INI' : k === yday ? 'KEMARIN' : `${+k.slice(8)} ${MON[+k.slice(5, 7) - 1].toUpperCase()}`);

  return (
    <>
      <nav>
        <div className="wrap">
          <div className="logo">CATATAN <mark>UANG</mark></div>
          <div className="links"><a href="#ringkasan">Ringkasan</a><a href="#dompet">Dompet</a><a href="#bulan">Bulan Ini</a><a href="#riwayat">Riwayat</a></div>
          <div className="chip">{rp(s.balance)}</div>
        </div>
      </nav>

      <section id="ringkasan"><div className="wrap">
        <span className="sticker s-g">SALDO</span>
        <div className="hero">
          <div className="card"><small>Total semua dompet</small><div className={'big' + (s.balance < 0 ? ' neg' : '')}>{rp(s.balance)}</div></div>
          <div className="card" style={{ background: 'var(--y)' }}><small>Boleh jajan / hari</small><div className="n">{rp(daily)}</div><div className="m">sisa {left} hari bulan ini</div></div>
        </div>
        {low && <div className="alert">GAWAT! Saldo tinggal tipis. Hemat dulu sampai ada pemasukan lagi.</div>}
      </div></section>

      <section id="dompet"><div className="wrap">
        <span className="sticker s-p">DOMPET</span>
        <div className="row dompet">
          <div className="card tile" style={{ background: 'var(--y)' }}><div className="ic">💵</div><small>Cash</small><div className="n">{rp(s.cash)}</div></div>
          <div className="card tile" style={{ background: 'var(--b)', color: '#fff' }}><div className="ic">🏦</div><small>Bank</small><div className="n">{rp(s.bank)}</div></div>
          <div className="card tile" style={{ background: 'var(--p)', color: '#fff' }}><div className="ic">🐷</div><small>Tabungan</small><div className="n">{rp(s.saving)}</div></div>
        </div>
      </div></section>

      <section id="bulan" className="y"><div className="wrap">
        <span className="sticker s-w">BULAN INI</span>
        <div className="row">
          <div className="card" style={{ background: 'var(--g)' }}><small>Masuk</small><div className="n">{rp(sum('income'))}</div></div>
          <div className="card"><small>Keluar</small><div className="n neg">{rp(sum('expense'))}</div></div>
        </div>
        <div className="card" style={{ marginTop: 22 }}>
          <span className="lbl">7 hari terakhir</span>
          <div className="chart">
            {week.map((w) => (
              <div key={w.k}><i style={{ height: Math.max(4, (w.v / wmax) * 82) + '%' }} /><span>{w.k.slice(8)}</span></div>
            ))}
          </div>
        </div>
        <div className="card" style={{ marginTop: 22 }}>
          <span className="lbl">Uang lari ke mana?</span>
          {catList.length === 0 && <span className="m">Belum ada pengeluaran bulan ini.</span>}
          {catList.map(([c, v], i) => (
            <div className="bar" key={c}>
              <span>{ICON[c] || '📦'} {c}</span>
              <i style={{ width: Math.max(8, (v / cmax) * 100) + '%', background: COLS[i % COLS.length] }} />
              <span style={{ textAlign: 'right' }}>{rp(v)}</span>
            </div>
          ))}
        </div>
      </div></section>

      <section id="riwayat" className="gr"><div className="wrap">
        <span className="sticker s-k">RIWAYAT</span>
        {rows.length === 0 && <div className="card m">Kirim pesan ke bot, misalnya: beli bakso 20k</div>}
        {groups.map((g) => (
          <div key={g.k}>
            <div className="day"><span>{label(g.k)}</span>{(() => { const e = g.items.filter((r) => r.type === 'expense').reduce((a, r) => a + r.amount, 0); return e ? <span className="neg">- {rp(e)}</span> : null; })()}</div>
            {g.items.map((r) => (
              <div className="card tx" key={r.id}>
                <div className="ic" style={{ background: r.type === 'expense' ? 'var(--y)' : r.type === 'income' ? 'var(--g)' : 'var(--p)' }}>{ICON[r.category] || '📦'}</div>
                <div className="tt">
                  <b>{r.note}</b>
                  <span className="m"><span className={'tag' + (r.wallet === 'bank' ? ' k' : '')}>{r.type === 'transfer' ? `${r.wallet}→${r.to_wallet}` : r.wallet}</span>{wib(r.created_at).slice(11, 16)}</span>
                </div>
                <div className={'amt ' + (r.type === 'expense' ? 'out' : r.type === 'income' ? 'in' : '')}>{SIGN[r.type]} {rp(r.amount)}</div>
              </div>
            ))}
          </div>
        ))}
      </div></section>
    </>
  );
}
