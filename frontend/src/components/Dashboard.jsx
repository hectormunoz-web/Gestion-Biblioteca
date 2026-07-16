import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [totalLibros, setTotalLibros] = useState(null);
  const [librosBajoStock, setLibrosBajoStock] = useState(null);
  const [prestamosActivos, setPrestamosActivos] = useState(null);
  const [prestamosAtrasados, setPrestamosAtrasados] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const [resLibros, resPrestamos] = await Promise.all([
          api.get("/libros"),
          api.get("/prestamos"),
        ]);
        setTotalLibros(resLibros.data.length);
        setLibrosBajoStock(resLibros.data.filter((l) => l.stock === 0).length);
        setPrestamosActivos(resPrestamos.data.filter((p) => p.estado === "activo").length);
        setPrestamosAtrasados(resPrestamos.data.filter((p) => p.estado === "atrasado").length);
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
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Libros registrados</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{totalLibros ?? "…"}</p>
        </div>
        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Sin existencias</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{librosBajoStock ?? "…"}</p>
        </div>
        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Préstamos activos</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{prestamosActivos ?? "…"}</p>
        </div>
        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Préstamos atrasados</h3>
          <p style={{ fontSize: "2rem", margin: 0, color: prestamosAtrasados > 0 ? "#b3261e" : "inherit" }}>
            {prestamosAtrasados ?? "…"}
          </p>
        </div>
      </div>
      <p style={{ color: "#666" }}>
        El módulo de reservas y multas se habilitará en el tercer parcial.
      </p>
    </div>
  );
}
