import { createClient } from '@supabase/supabase-js';

export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

export const rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
export const wib = (d = new Date()) =>
  new Date(d).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });

export async function summary() {
  const { data, error } = await db.from('summary').select('*').single();
  if (error) throw error;
  const [income, expense, si, so] = [data.income, data.expense, data.saving_in, data.saving_out].map(Number);
  return { income, expense, balance: income - expense - si + so, saving: si - so };
}
