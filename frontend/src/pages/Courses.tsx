import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

type Course = {
  id: string;
  title: string;
  description: string;
  author: { displayName: string };
  lessons: { id: string }[];
};

export function Courses() {
  const { user } = useAuth();
  const [list, setList] = useState<Course[]>([]);
  const [mine, setMine] = useState<{ course: Course }[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const c = await api<Course[]>("/courses");
        setList(c);
        if (user) {
          const m = await api<{ course: Course }[]>("/courses/mine/list");
          setMine(m);
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Қате");
      }
    })();
  }, [user]);

  async function enroll(courseId: string) {
    try {
      await api("/courses/enroll", { method: "POST", body: JSON.stringify({ courseId }) });
      const m = await api<{ course: Course }[]>("/courses/mine/list");
      setMine(m);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{S.courses}</h2>
      {err && <p className="error">{err}</p>}
      {user && mine.length > 0 && (
        <section className="card" style={{ marginBottom: "1rem" }}>
          <h3>{S.myCourses}</h3>
          <ul>
            {mine.map((e) => (
              <li key={e.course.id}>
                <Link to={`/courses/${e.course.id}`}>{e.course.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid two">
        {list.map((c) => (
          <div key={c.id} className="card">
            <h3 style={{ marginTop: 0 }}>{c.title}</h3>
            <p className="muted">{c.description}</p>
            <p className="muted">
              Автор: {c.author.displayName} · {c.lessons.length} сабақ
            </p>
            <Link to={`/courses/${c.id}`}>Ашу</Link>
            {user && (
              <>
                {" · "}
                <button type="button" className="ghost" onClick={() => void enroll(c.id)}>
                  {S.enroll}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
