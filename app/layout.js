export const metadata = { title: 'Catatan Uang' };

const css = `
:root{--k:#000;--bg:#f6f6f6;--y:#ffd600;--g:#00ff85;--p:#ff0f7b;--b:#3b82f6;--pu:#8b3dff;--r:#ff3b2f;color-scheme:light}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:84px}
body{margin:0;background:var(--bg);color:var(--k);font:600 16px/1.45 Inter,system-ui,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:0 16px}
nav{position:sticky;top:0;z-index:5;background:#fff;border-bottom:5px solid var(--k)}
nav .wrap{display:flex;align-items:center;gap:14px;height:68px}
.logo{font-weight:900;font-size:20px;letter-spacing:-.5px;white-space:nowrap}
mark{background:var(--y);padding:0 6px;border:3px solid var(--k)}
.links{display:flex;gap:16px;overflow-x:auto;flex:1;scrollbar-width:none;font-weight:800;font-size:14px}
.links::-webkit-scrollbar{display:none}.links a{color:var(--k);text-decoration:none}
.chip{background:var(--pu);color:#fff;border:3px solid var(--k);box-shadow:4px 4px 0 var(--k);padding:4px 10px;font-weight:900;font-size:14px;white-space:nowrap}
section{padding:46px 0 54px;border-bottom:5px solid var(--k)}
.y{background:var(--y)}.gr{background:var(--g)}
.sticker{display:block;width:max-content;max-width:100%;margin:0 auto 34px;padding:4px 22px;font-weight:900;font-size:clamp(32px,10vw,54px);letter-spacing:-2px;line-height:1.15;border:4px solid var(--k);box-shadow:7px 7px 0 var(--k);transform:rotate(-2deg);background:#fff}
.s-g{background:var(--g)}.s-p{background:var(--p);color:#fff}.s-w{background:#fff}.s-k{background:var(--k);color:#fff;box-shadow:7px 7px 0 var(--p)}
.card{border:4px solid var(--k);background:#fff;box-shadow:6px 6px 0 var(--k);padding:16px}
.card small,.lbl{display:block;font-weight:900;font-size:12px;letter-spacing:1px;text-transform:uppercase}
.big{font-weight:900;letter-spacing:-2px;line-height:1;font-size:clamp(44px,14vw,84px);margin:6px 0 2px;word-break:break-all}
.neg{color:var(--r)}
.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:18px}
.hero{display:grid;grid-template-columns:1.6fr 1fr;gap:18px}
@media(max-width:560px){.hero{grid-template-columns:1fr}}
.n{font-weight:900;font-size:clamp(22px,6.5vw,32px);letter-spacing:-1px;line-height:1.1;margin-top:4px;word-break:break-all}
.tile{text-align:center;padding:18px 8px;transition:transform .12s,box-shadow .12s}
.tile:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--k)}
.tile .ic{font-size:34px;line-height:1}
.alert{margin:26px 0 0;padding:12px 16px;background:var(--r);color:#fff;border:4px solid var(--k);box-shadow:6px 6px 0 var(--k);font-weight:900;transform:rotate(-1deg)}
.chart{display:flex;align-items:flex-end;gap:8px;height:150px;margin-top:10px}
.chart div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;font-size:12px;font-weight:900}
.chart i{display:block;width:100%;border:3px solid var(--k);background:var(--k);min-height:6px}
.chart div:last-child i{background:var(--p)}
.bar{display:grid;grid-template-columns:78px 1fr 92px;gap:8px;align-items:center;margin:12px 0;font-size:14px;font-weight:800}
.bar i{display:block;height:22px;border:3px solid var(--k)}
.day{display:flex;justify-content:space-between;align-items:center;margin:26px 0 12px;font-weight:900}
.day:first-of-type{margin-top:0}
.day span:first-child{background:var(--k);color:#fff;padding:3px 12px;transform:rotate(-1.5deg)}
.tx{display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:14px;box-shadow:5px 5px 0 var(--k)}
.tx .ic{flex:none;width:46px;height:46px;display:grid;place-items:center;font-size:24px;border:3px solid var(--k)}
.tx .tt{flex:1;min-width:0}.tx b{display:block;font-weight:800;overflow:hidden;text-overflow:ellipsis}
.tag{display:inline-block;margin-right:6px;padding:0 7px;border:2px solid var(--k);font-size:11px;font-weight:900;text-transform:uppercase}
.tag.k{background:var(--k);color:#fff}
.m{font-size:12px;font-weight:700;opacity:.7}
.amt{font-weight:900;font-size:17px;white-space:nowrap;letter-spacing:-.5px}.amt.out{color:var(--r)}.amt.in{color:#00a553}
input,button{font:inherit;font-weight:800;padding:12px;border:4px solid var(--k);border-radius:0;background:#fff;color:var(--k)}
button{background:var(--p);color:#fff;box-shadow:4px 4px 0 var(--k);cursor:pointer}
button:active{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--k)}
:focus-visible{outline:4px solid var(--b);outline-offset:2px}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&display=swap" rel="stylesheet" />
        <style>{css}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
