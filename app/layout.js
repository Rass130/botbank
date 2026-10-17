export const metadata = { title: 'Catatan Keuangan' };

const css = `
:root{--ink:#0b0b0b;--paper:#f6f3ec;--red:#e3231b;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;color:var(--ink);font:500 16px/1.45 'Zen Kaku Gothic New',system-ui,sans-serif;background:var(--paper);background-image:radial-gradient(#0000001c 1px,transparent 1.2px);background-size:6px 6px}
main{max-width:680px;margin:0 auto;padding:20px 14px 80px}
.disp,h1,h2{font-family:'Dela Gothic One','Zen Kaku Gothic New',sans-serif;font-weight:400}
.ch{display:inline-block;font-weight:900;font-size:12px;letter-spacing:2px;text-transform:uppercase;border:3px solid var(--ink);padding:1px 8px;background:var(--ink);color:var(--paper)}
h1{font-size:clamp(28px,9vw,44px);line-height:1;margin:8px 0 18px;letter-spacing:-1px}
h2{display:inline-block;font-size:15px;margin:34px 0 12px;padding:5px 14px;background:var(--ink);color:var(--paper);transform:skewX(-8deg)}
.panels{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.p{position:relative;border:4px solid var(--ink);background:var(--paper);padding:12px 14px;overflow:hidden}
.s3{grid-column:span 3}.s6{grid-column:span 6}
.p small{display:block;font-weight:900;font-size:12px;letter-spacing:1.5px;text-transform:uppercase}
.p .disp{font-size:clamp(22px,6.4vw,32px);line-height:1.15;word-break:break-all}
.hero{padding:20px 16px 22px;background-image:repeating-conic-gradient(from 0deg at 62% 50%,transparent 0 4deg,#0000001f 4deg 5deg)}
.hero .disp{font-size:clamp(40px,13vw,68px);line-height:1.05}
.neg{color:var(--red)}
.sfx{position:absolute;top:8px;right:10px;font-family:'Dela Gothic One',sans-serif;font-size:22px;color:var(--red);transform:rotate(9deg);-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill;text-shadow:2px 2px 0 var(--ink)}
.hatch{background-image:repeating-linear-gradient(45deg,transparent 0 6px,#0000001a 6px 7px)}
.say{position:relative;margin:24px 4px 4px;padding:10px 14px;background:#fff;border:3px solid var(--ink);border-radius:18px;font-weight:700;font-size:15px}
.say b{font-family:'Dela Gothic One',sans-serif;font-weight:400;color:var(--red);margin-right:6px}
.say:before,.say:after{content:'';position:absolute;left:30px;border-style:solid;border-color:transparent}
.say:before{top:-16px;border-width:0 10px 16px;border-bottom-color:var(--ink)}
.say:after{top:-10px;margin-left:2px;border-width:0 8px 12px;border-bottom-color:#fff}
.bar{display:grid;grid-template-columns:76px 1fr 96px;gap:8px;align-items:center;margin:10px 0;font-weight:700;font-size:15px}
.bar i{display:block;height:20px;border:3px solid var(--ink);background:repeating-linear-gradient(135deg,var(--ink) 0 2px,transparent 2px 6px)}
.bar:first-of-type i{background:var(--red)}
.tx{display:grid;grid-template-columns:54px 1fr auto;gap:12px;align-items:center;border:3px solid var(--ink);background:var(--paper);padding:9px 12px;margin-bottom:-3px}
.tx time{font-weight:900;font-size:12px;line-height:1.2;text-align:center;border-right:3px solid var(--ink);padding-right:10px}
.tx b{display:block;font-weight:700}
.tag{display:inline-block;margin-right:5px;padding:0 7px;border:2px solid var(--ink);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.5px}
.tag.k{background:var(--ink);color:var(--paper)}
.m{font-size:12px;font-weight:500;opacity:.75}
.amt{font-family:'Dela Gothic One',sans-serif;font-size:17px;white-space:nowrap}
.amt.out{color:var(--red)}
input,button{font:inherit;font-weight:700;padding:12px;border:3px solid var(--ink);background:#fff;color:var(--ink);border-radius:0}
button{background:var(--ink);color:var(--paper);cursor:pointer}
button:active{transform:translate(2px,2px)}
:focus-visible{outline:3px solid var(--red);outline-offset:2px}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Zen+Kaku+Gothic+New:wght@500;700;900&display=swap" rel="stylesheet" />
        <style>{css}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
