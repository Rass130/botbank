export default function Login({ searchParams }) {
  return (
    <main>
      <h1>Catatan Keuangan</h1>
      <form method="POST" action="/api/login" className="pan" style={{ display: 'flex', gap: 10 }}>
        <input type="password" name="password" placeholder="Password" required autoFocus style={{ flex: 1, minWidth: 0 }} />
        <button>Masuk</button>
      </form>
      {searchParams?.salah && <p className="out">Password salah, coba lagi.</p>}
    </main>
  );
}
