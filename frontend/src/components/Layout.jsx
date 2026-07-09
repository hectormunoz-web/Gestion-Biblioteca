import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function manejarSalir() {
    logout();
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>📚 Biblioteca UJCV</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/libros">Libros</Link>
        {usuario?.rol === "admin" && <Link to="/usuarios">Usuarios</Link>}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: 8 }}>
          {usuario?.nombre} · {usuario?.rol}
        </div>
        <button onClick={manejarSalir}>Cerrar sesión</button>
      </aside>
      <main className="contenido">{children}</main>
    </div>
  );
}
