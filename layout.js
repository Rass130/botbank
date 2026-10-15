export const metadata = { title: 'Catatan Keuangan' };

const css = `
:root{--bg:#f3f5f2;--card:#fff;--ink:#1c2420;--mute:#66726b;--line:#dde3de;--in:#1f7a4d;--out:#b3402a;--save:#2a5db0}
@media (prefers-color-scheme:dark){:root{--bg:#121714;--card:#1a211d;--ink:#e8eee9;--mute:#8f9c94;--line:#2a332d;--in:#4cc88a;--out:#f08a74;--save:#7aa7f0}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 60px}
h1{font-size:15px;font-weight:600;color:var(--mute);margin:0 0 4px}
.big{font-size:44px;font-weight:700;letter-spacing:-1px;margin:0 0 20px}
.big.neg{color:var(--out)}
.row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.box{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
.box small{color:var(--mute);display:block}.box b{font-size:17px}
h2{font-size:16px;margin:26px 0 10px}
.bar{display:grid;grid-template-columns:90px 1fr 90px;gap:8px;align-items:center;margin:6px 0;font-size:14px}
.bar i{display:block;height:10px;border-radius:5px;background:var(--out)}
table{width:100%;border-collapse:collapse;font-size:14px}
td{padding:9px 4px;border-bottom:1px solid var(--line)}td:last-child{text-align:right;white-space:nowrap}
.in{color:var(--in)}.out{color:var(--out)}.sv{color:var(--save)}.m{color:var(--mute);font-size:12px}
input,button{font:inherit;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
button{background:var(--ink);color:var(--bg);cursor:pointer}
:focus-visible{outline:2px solid var(--save);outline-offset:2px}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>{css}</style></head>
      <body>{children}</body>
    </html>
  );
}
