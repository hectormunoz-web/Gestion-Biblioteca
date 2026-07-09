import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [totalLibros, setTotalLibros] = useState(null);
  const [librosBajoStock, setLibrosBajoStock] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const { data } = await api.get("/libros");
        setTotalLibros(data.length);
        setLibrosBajoStock(data.filter((l) => l.stock === 0).length);
      } catch (err) {
        setError(err.mensaje || "No se pudieron cargar los indicadores.");
      }
    }
    cargar();
  }, []);

  return (
    <div>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      {error && <div className="error-general">{error}</div>}
      <div style={{ display: "flex", gap: 20 }}>
        <div className="tarjeta" style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Libros registrados</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{totalLibros ?? "…"}</p>
        </div>
        <div className="tarjeta" style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Sin existencias</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{librosBajoStock ?? "…"}</p>
        </div>
      </div>
      <p style={{ color: "#666" }}>
        Los módulos de préstamos, reservas y multas se habilitarán en los próximos sprints.
      </p>
    </div>
  );
}
