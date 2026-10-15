import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, rp, wib, summary } from '@/lib/db';
import { token } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const SIGN = { income: ['+', 'in'], expense: ['-', 'out'], saving_in: ['→ 🐷', 'sv'], saving_out: ['← 🐷', 'sv'] };

export default async function Home() {
  if (cookies().get('fb')?.value !== token()) redirect('/login');

  const s = await summary();
  const { data } = await db.from('transactions').select('*').order('id', { ascending: false }).limit(300);
  const rows = data || [];
  const month = wib().slice(0, 7);
  const thisMonth = rows.filter((r) => wib(r.created_at).startsWith(month));
  const sum = (list, ty) => list.filter((r) => r.type === ty).reduce((a, r) => a + r.amount, 0);

  const cats = {};
  thisMonth.filter((r) => r.type === 'expense').forEach((r) => (cats[r.category] = (cats[r.category] || 0) + r.amount));
  const catList = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const max = catList[0]?.[1] || 1;

  return (
    <main>
      <h1>Saldo</h1>
      <p className={'big' + (s.balance < 0 ? ' neg' : '')}>{rp(s.balance)}</p>
      {s.balance <= 50000 && <p className="out">⚠️ Saldo menipis, hemat dulu sampai ada pemasukan.</p>}
      <div className="row">
        <div className="box"><small>Tabungan</small><b className="sv">{rp(s.saving)}</b></div>
        <div className="box"><small>Masuk bulan ini</small><b className="in">{rp(sum(thisMonth, 'income'))}</b></div>
        <div className="box"><small>Keluar bulan ini</small><b className="out">{rp(sum(thisMonth, 'expense'))}</b></div>
      </div>

      <h2>Pengeluaran bulan ini per kategori</h2>
      {catList.length === 0 && <p className="m">Belum ada pengeluaran bulan ini.</p>}
      {catList.map(([c, v]) => (
        <div className="bar" key={c}>
          <span>{c}</span><i style={{ width: (v / max) * 100 + '%' }} /><span style={{ textAlign: 'right' }}>{rp(v)}</span>
        </div>
      ))}

      <h2>Transaksi terakhir</h2>
      {rows.length === 0 && <p className="m">Kirim pesan ke bot, misalnya: beli bakso 20k</p>}
      <table><tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.note}<div className="m">{r.category} · {wib(r.created_at).slice(0, 16)}</div></td>
            <td className={SIGN[r.type][1]}>{SIGN[r.type][0]} {rp(r.amount)}</td>
          </tr>
        ))}
      </tbody></table>
    </main>
  );
}
