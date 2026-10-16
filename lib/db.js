import { createClient } from '@supabase/supabase-js';

export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

export const rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
export const wib = (d = new Date()) =>
  new Date(d).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });

export async function summary() {
  const [a, b] = await Promise.all([
    db.from('summary').select('*').single(),
    db.from('wallet_balance').select('*'),
  ]);
  if (a.error) throw a.error;
  if (b.error) throw b.error;
  const w = (n) => Number(b.data.find((x) => x.wallet === n)?.balance || 0);
  const cash = w('cash'), bank = w('bank');
  return { cash, bank, balance: cash + bank, saving: Number(a.data.saving_in) - Number(a.data.saving_out) };
}
