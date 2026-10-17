export default function Login({ searchParams }) {
  return (
    <main>
      <span className="ch">Terkunci</span>
      <h1>Catatan Keuangan</h1>
      <form method="POST" action="/api/login" className="p" style={{ display: 'flex', gap: 10 }}>
        <input type="password" name="password" placeholder="Password" required autoFocus style={{ flex: 1, minWidth: 0 }} />
        <button>Masuk</button>
      </form>
      {searchParams?.salah && <p className="neg disp">Password salah!</p>}
    </main>
  );
}
