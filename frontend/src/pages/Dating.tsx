import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

type Sug = { id: string; displayName: string; bio: string; city: string; score: number };

export function Dating() {
  const { user } = useAuth();
  const [list, setList] = useState<Sug[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const s = await api<Sug[]>("/dating/suggestions");
        setList(s);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Қате");
      }
    })();
  }, [user]);

  async function sendMatch(targetUserId: string) {
    try {
      await api("/dating/match", { method: "POST", body: JSON.stringify({ targetUserId }) });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  if (!user) return <p className="muted">Танысу үшін {S.login} жасаңыз.</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{S.dating}</h2>
      <p className="muted">{S.suggestions} (MVP — қалай және ұпай кездейсоқ)</p>
      {err && <p className="error">{err}</p>}
      <div className="grid two">
        {list.map((p) => (
          <div key={p.id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.displayName}</h3>
            <p className="muted">{p.city}</p>
            <p>{p.bio || "—"}</p>
            <button type="button" className="primary" onClick={() => void sendMatch(p.id)}>
              {S.match}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
