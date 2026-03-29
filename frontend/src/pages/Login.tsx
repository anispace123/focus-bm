import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setPending(true);
    try {
      await login(email, password);
      nav("/");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Қате");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <h2 style={{ marginTop: 0 }}>{S.login}</h2>
      <form onSubmit={onSubmit}>
        <label className="muted">{S.email}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="muted">{S.password}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="error">{err}</p>}
        <button type="submit" className="primary" disabled={pending}>
          {S.login}
        </button>
      </form>
      <p className="muted">
        Аккаунтыңыз жоқ па? <Link to="/register">{S.register}</Link>
      </p>
    </div>
  );
}
