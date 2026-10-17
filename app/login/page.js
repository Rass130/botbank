export default function Login({ searchParams }) {
  return (
    <section className="y" style={{ minHeight: '100vh' }}>
      <div className="wrap">
        <span className="sticker s-w">TERKUNCI 🔒</span>
        <form method="POST" action="/api/login" className="card" style={{ display: 'flex', gap: 12 }}>
          <input type="password" name="password" placeholder="Password" required autoFocus style={{ flex: 1, minWidth: 0 }} />
          <button>MASUK</button>
        </form>
        {searchParams?.salah && <div className="alert">Password salah, coba lagi!</div>}
      </div>
    </section>
  );
}
