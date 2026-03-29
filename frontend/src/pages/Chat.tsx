import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "../api";
import { envelopeDecryptDemo, envelopeEncryptPlaintextForDemo } from "../crypto/clientEnvelope";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

type Conv = {
  id: string;
  isGroup: boolean;
  members: { user: { id: string; displayName: string } }[];
  messages: { ciphertext: string; senderId: string; id: string }[];
};

type Msg = { id: string; conversationId: string; ciphertext: string; senderId: string };

export function Chat() {
  const { user, token } = useAuth();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [peerId, setPeerId] = useState("");
  const [err, setErr] = useState("");

  const socket: Socket | null = useMemo(() => {
    if (!token) return null;
    const raw = import.meta.env.VITE_API_URL as string | undefined;
    const apiOrigin = raw?.trim() ? raw.trim().replace(/\/$/, "") : undefined;
    const s = io(apiOrigin, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket"],
    });
    return s;
  }, [token]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  async function loadConvs() {
    try {
      const list = await api<Conv[]>("/messaging/conversations");
      setConvs(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  async function openDm() {
    if (!peerId.trim()) return;
    try {
      const c = await api<{ id: string }>("/messaging/conversations/dm", {
        method: "POST",
        body: JSON.stringify({ peerUserId: peerId.trim() }),
      });
      setActiveId(c.id);
      await loadConvs();
      await loadMessages(c.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  async function loadMessages(cid: string) {
    const m = await api<Msg[]>(`/messaging/conversations/${cid}/messages`);
    setMessages(m);
  }

  useEffect(() => {
    void loadConvs();
  }, []);

  useEffect(() => {
    if (!socket || !activeId) return;
    const onMsg = (payload: { conversationId: string; message: Msg }) => {
      if (payload.conversationId !== activeId) return;
      setMessages((prev) => [...prev.filter((m) => m.id !== payload.message.id), payload.message]);
    };
    socket.on("chat:message", onMsg);
    return () => {
      socket.off("chat:message", onMsg);
    };
  }, [socket, activeId]);

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
  }, [activeId]);

  function send() {
    if (!socket || !activeId || !text.trim()) return;
    const ciphertext = envelopeEncryptPlaintextForDemo(text.trim());
    socket.emit("chat:send", { conversationId: activeId, ciphertext }, (ack: { error?: string }) => {
      if (ack?.error) setErr(ack.error);
    });
    setText("");
  }

  if (!user) return <p className="muted">{S.login} қажет.</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{S.chat}</h2>
      <p className="muted">{S.e2eNote}</p>
      {err && <p className="error">{err}</p>}
      <div className="grid two">
        <div className="card">
          <h3>{S.conversations}</h3>
          <p className="muted">Жаңа DM: пайдаланушы ID</p>
          <input value={peerId} onChange={(e) => setPeerId(e.target.value)} placeholder="user id" />
          <button type="button" className="primary" onClick={() => void openDm()}>
            Ашу
          </button>
          <ul>
            {convs.map((c) => (
              <li key={c.id}>
                <button type="button" className="ghost" onClick={() => setActiveId(c.id)}>
                  {c.id.slice(0, 8)}… {c.id === activeId ? "✓" : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>{S.newMessage}</h3>
          {!activeId && <p className="muted">Сөйлесуді таңдаңыз немесе жаңасын ашыңыз.</p>}
          {activeId && (
            <>
              <div style={{ minHeight: 200, marginBottom: "0.75rem" }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ marginBottom: 8 }}>
                    <span className="muted">{m.senderId === user.id ? "Сіз" : "Басқа"}: </span>
                    <span>{safeDecrypt(m.ciphertext)}</span>
                  </div>
                ))}
              </div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={S.newMessage}
              />
              <button type="button" className="primary" onClick={send}>
                {S.send}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function safeDecrypt(ciphertext: string): string {
  try {
    return envelopeDecryptDemo(ciphertext);
  } catch {
    return "[шифрланған]";
  }
}
