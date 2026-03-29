import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

export function Home() {
  const { user } = useAuth();
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{S.tagline}</h2>
      <p className="muted">
        Бұл қосымша <strong>FOCUS.bm</strong> компаниясының экожүйесіне арналған: курстар, хабарламалар,
        лента және танысу. Заңнамалық келісімдер мен ЭЦП/SMS арқылы кіру сияқты рәсімдер{" "}
        <a href={S.companySiteUrl} target="_blank" rel="noopener noreferrer">
          ресми сайтта
        </a>{" "}
        — {S.companySiteUrl.replace(/^https:\/\//, "")}
      </p>
      {!user && (
        <p>
          <Link to="/login">{S.login}</Link> немесе <Link to="/register">{S.register}</Link>
        </p>
      )}
      {user && (
        <p>
          Қош келдіңіз, <strong>{user.displayName}</strong>.
        </p>
      )}
    </div>
  );
}
