import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="login-box">
      <span className="logo">Kolokui</span>
      <h1 className="page-title" style={{ fontSize: 32, margin: 0 }}>
        Masuk ke admin
      </h1>
      <LoginForm />
    </main>
  );
}
