const UNIT = { k: 1e3, rb: 1e3, ribu: 1e3, jt: 1e6, juta: 1e6 };
const CATS = {
  makan: ['makan', 'bakso', 'nasi', 'kopi', 'jajan', 'minum', 'ayam', 'mie', 'snack', 'warteg'],
  transport: ['bensin', 'ojek', 'parkir', 'grab', 'gojek', 'tol', 'angkot', 'servis'],
  tagihan: ['listrik', 'pulsa', 'kuota', 'wifi', 'internet', 'kos', 'sewa', 'cicilan'],
  belanja: ['belanja', 'baju', 'sepatu', 'shopee', 'tokped'],
  hiburan: ['game', 'netflix', 'spotify', 'nonton', 'topup', 'top up'],
};

export function parse(text) {
  const t = text.toLowerCase().trim();
  const m = t.match(/(\d[\d.,]*)\s*(juta|jt|ribu|rb|k)?\b/);
  if (!m) return null;
  const n = m[2]
    ? Math.round(parseFloat(m[1].replace(',', '.')) * UNIT[m[2]])
    : parseInt(m[1].replace(/[.,]/g, ''), 10);
  if (!n || n <= 0) return null;

  const has = (...w) => w.some((x) => t.includes(x));
  let type = 'expense';
  if (has('ambil tabungan', 'tarik tabungan', 'pakai tabungan')) type = 'saving_out';
  else if (has('tabung', 'nabung')) type = 'saving_in';
  else if (has('beli', 'bayar', 'jajan', 'belanja', 'isi ', 'top up', 'topup')) type = 'expense';
  else if (has('gaji', 'dapat', 'dapet', 'terima', 'jual', 'bonus', 'untung', 'masuk', 'thr', 'transfer dari')) type = 'income';

  let wallet = /\b(tf|trf|transfer|bank|qris|debit|bca|bri|bni|mandiri|jago|seabank|dana|ovo|gopay|shopeepay)\b/.test(t) ? 'bank' : 'cash';
  let to_wallet = null;
  if (type === 'expense' && has('tarik tunai', 'tarik cash', 'tarik atm')) { type = 'transfer'; wallet = 'bank'; to_wallet = 'cash'; }
  else if (type === 'expense' && has('setor')) { type = 'transfer'; wallet = 'cash'; to_wallet = 'bank'; }

  let category = 'lainnya';
  if (type === 'transfer') category = 'pindah';
  else
  if (type === 'income') category = 'pemasukan';
  else if (type.startsWith('saving')) category = 'tabungan';
  else for (const [c, words] of Object.entries(CATS)) if (has(...words)) { category = c; break; }

  return { type, wallet, to_wallet, amount: n, category, note: text.replace(m[0], '').trim() || text };
}
