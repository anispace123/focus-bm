import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

type Post = {
  id: string;
  content: string;
  createdAt: string;
  user: { displayName: string };
  likes: { userId: string }[];
};

export function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    try {
      const p = await api<Post[]>("/social/feed");
      setPosts(p);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function publish() {
    if (!user) return;
    try {
      await api("/social/posts", { method: "POST", body: JSON.stringify({ content }) });
      setContent("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  async function like(id: string) {
    if (!user) return;
    try {
      await api(`/social/posts/${id}/like`, { method: "POST", body: "{}" });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{S.feed}</h2>
      {err && <p className="error">{err}</p>}
      {user && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <textarea
            rows={3}
            placeholder={S.postPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="button" className="primary" onClick={() => void publish()}>
            {S.publish}
          </button>
        </div>
      )}
      {posts.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: "0.75rem" }}>
          <strong>{p.user.displayName}</strong>
          <p>{p.content}</p>
          <p className="muted">
            {user && (
              <button type="button" className="ghost" onClick={() => void like(p.id)}>
                ❤ {S.likes}: {p.likes.length}
              </button>
            )}
            {!user && <span>{p.likes.length} {S.likes}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
