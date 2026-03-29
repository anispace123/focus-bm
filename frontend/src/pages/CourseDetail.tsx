import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { S } from "../strings";

type Lesson = { id: string; title: string; videoUrl: string; sortOrder: number };
type Course = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const c = await api<Course>(`/courses/${id}`);
        setCourse(c);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Қате");
      }
    })();
  }, [id]);

  async function saveProgress() {
    if (!id || !user) return;
    try {
      await api("/courses/progress", {
        method: "PATCH",
        body: JSON.stringify({ courseId: id, progress }),
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Қате");
    }
  }

  if (!course) return <p>{err || "Жүктелуде…"}</p>;

  const firstVideo = course.lessons.find((l) => l.videoUrl)?.videoUrl;

  return (
    <div>
      <Link to="/courses">← Курстарға</Link>
      <h2>{course.title}</h2>
      <p className="muted">{course.description}</p>
      {firstVideo && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p className="muted">Бейне плеер (MVP — сыртқы URL)</p>
          <video
            controls
            style={{ width: "100%", borderRadius: 8 }}
            src={firstVideo}
            poster=""
          />
        </div>
      )}
      <div className="card">
        <h3>Сабақтар</h3>
        <ol>
          {course.lessons.map((l) => (
            <li key={l.id}>
              {l.title}
              {l.videoUrl ? " · бейне бар" : ""}
            </li>
          ))}
        </ol>
      </div>
      {user && (
        <div className="card">
          <label>
            {S.progress}: {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
          <button type="button" className="primary" onClick={() => void saveProgress()}>
            Сақтау
          </button>
        </div>
      )}
    </div>
  );
}
