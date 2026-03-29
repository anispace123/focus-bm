import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Admin } from "./pages/Admin";
import { Chat } from "./pages/Chat";
import { CourseDetail } from "./pages/CourseDetail";
import { Courses } from "./pages/Courses";
import { Dating } from "./pages/Dating";
import { Feed } from "./pages/Feed";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { S } from "./strings";

function Shell() {
  const { user, logout, loading } = useAuth();
  if (loading) return <p style={{ padding: "2rem" }}>Жүктелуде…</p>;

  return (
    <div className="layout">
      <header>
        <div className="brand">
          <h1>{S.appName}</h1>
          <span className="brand-badge">{S.companyBadge}</span>
        </div>
        <nav>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            {S.home}
          </NavLink>
          <NavLink to="/courses">{S.courses}</NavLink>
          <NavLink to="/feed">{S.feed}</NavLink>
          <NavLink to="/chat">{S.chat}</NavLink>
          <NavLink to="/dating">{S.dating}</NavLink>
          {user?.role === "ADMIN" && <NavLink to="/admin">{S.admin}</NavLink>}
          {user ? (
            <button type="button" className="ghost" onClick={logout}>
              {S.logout}
            </button>
          ) : (
            <>
              <NavLink to="/login">{S.login}</NavLink>
              <NavLink to="/register">{S.register}</NavLink>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/dating" element={<Dating />} />
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/admin"
            element={user?.role === "ADMIN" ? <Admin /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <a href={S.companySiteUrl} target="_blank" rel="noopener noreferrer">
          {S.companySiteLabel}
        </a>
        <span className="footer-sep">·</span>
        <span className="muted footer-note">{S.appName}</span>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
