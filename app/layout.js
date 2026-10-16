export const metadata = { title: 'Catatan Keuangan' };

const css = `
:root{--ink:#111;--bg:#fff3c4;--y:#ffd93d;--pink:#ff7eb6;--cyan:#5ad1e6;--lime:#9be564;--red:#ff4d4d;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;color:var(--ink);font:700 16px/1.45 'Comic Neue',system-ui,sans-serif;background:var(--bg);background-image:radial-gradient(#0002 1.6px,transparent 1.6px);background-size:14px 14px}
main{max-width:640px;margin:0 auto;padding:18px 14px 70px}
h1,h2,.num{font-family:Bangers,Impact,sans-serif;font-weight:400;letter-spacing:1px}
h1{display:inline-block;font-size:26px;margin:0 0 16px;padding:4px 14px;background:var(--pink);border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);transform:rotate(-2deg)}
h2{font-size:24px;margin:30px 0 10px}
.pan{border:3px solid var(--ink);border-radius:12px;box-shadow:6px 6px 0 var(--ink);padding:14px;background:#fff}
.hero{background:var(--y);background-image:radial-gradient(#0003 1.6px,transparent 1.6px);background-size:10px 10px;padding:18px 16px}
.hero small{display:block;font-size:15px}
.hero .num{font-size:clamp(44px,15vw,72px);line-height:1.05;word-break:break-all}
.hero .num.neg{color:var(--red)}
.say{position:relative;margin:22px 0 6px;padding:10px 14px;background:#fff;border:3px solid var(--ink);border-radius:16px;font-size:15px}
.say:before{content:'';position:absolute;top:-16px;left:28px;border:8px solid transparent;border-bottom:8px solid var(--ink);border-top:0;border-width:0 9px 14px}
.say:after{content:'';position:absolute;top:-9px;left:30px;border:solid transparent;border-width:0 7px 11px;border-bottom-color:#fff}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}
.grid .pan{padding:10px 12px}.grid small{display:block;font-size:14px}.grid .num{font-size:28px}
.cash{background:var(--lime)}.bank{background:var(--cyan)}.sav{background:var(--pink)}
.wide{grid-column:1/-1}
.bar{display:grid;grid-template-columns:78px 1fr 92px;gap:8px;align-items:center;margin:9px 0;font-size:15px}
.bar i{display:block;height:18px;border:3px solid var(--ink);border-radius:9px;background:var(--red)}
.tx{display:flex;justify-content:space-between;gap:10px;margin-bottom:12px;padding:10px 12px;box-shadow:4px 4px 0 var(--ink)}
.tx b{display:block}.m{font-size:13px;font-weight:700;opacity:.7}
.tag{display:inline-block;padding:0 7px;margin-right:4px;border:2px solid var(--ink);border-radius:8px;font-size:12px;background:var(--y)}
.amt{text-align:right;white-space:nowrap;font-family:Bangers,Impact,sans-serif;font-size:22px;letter-spacing:.5px}
.in{color:#0b7a3b}.out{color:#d12a2a}.sv{color:#2447b3}
input,button{font:inherit;padding:11px 12px;border:3px solid var(--ink);border-radius:10px;background:#fff;color:var(--ink)}
button{background:var(--pink);box-shadow:4px 4px 0 var(--ink);cursor:pointer}
button:active{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--ink)}
:focus-visible{outline:3px solid var(--cyan);outline-offset:2px}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@700&display=swap" rel="stylesheet" />
        <style>{css}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
