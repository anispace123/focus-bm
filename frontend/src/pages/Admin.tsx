import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

type Stats = { users: number; courses: number; posts: number; messages: number };
type U = { id: string; email: string; displayName: string; role: string; blocked: boolean };

export function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<U[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    void (async () => {
      try {
        const s = await api<Stats>("/admin/stats");
        const u = await api<U[]>("/admin/users");
        setStats(s);
        setUsers(u);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Қате");
      }
    })();
  }, [user]);

  async function toggleBlock(u: U) {
    try {
      await api(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ blocked: !u.blocked }),
      });
      const list = await api<U[]>("/admin/users");
      setUsers(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  if (!user) return <p>{S.login} қажет.</p>;
  if (user.role !== "ADMIN") return <p className="muted">Бұл бет тек әкімшіге.</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{S.admin}</h2>
      {err && <p className="error">{err}</p>}
      {stats && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3>{S.stats}</h3>
          <p>
            Пайдаланушылар: {stats.users} · Курстар: {stats.courses} · Посттар: {stats.posts} ·
            Хабарламалар: {stats.messages}
          </p>
        </div>
      )}
      <div className="card">
        <h3>{S.users}</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Аты</th>
              <th>Email</th>
              <th>Рөл</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.displayName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button type="button" className="ghost" onClick={() => void toggleBlock(u)}>
                    {u.blocked ? "Бұғатты ашу" : "Бұғаттау"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
