export default function Footer() {
  return (
    <div className="wrap">
      <footer className="site-footer">
        <span className="logo">Kolokui</span>
        <span>
          © {new Date().getFullYear()} Kolokui. Percakapan dengan Tuhan,
          sesama, dan hidup.
        </span>
      </footer>
    </div>
  );
}
