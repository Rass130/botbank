export default function Login({ searchParams }) {
  return (
    <main>
      <h1>Catatan Keuangan</h1>
      <form method="POST" action="/api/login" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input type="password" name="password" placeholder="Password" required autoFocus style={{ flex: 1 }} />
        <button>Masuk</button>
      </form>
      {searchParams?.salah && <p className="out">Password salah.</p>}
    </main>
  );
}
