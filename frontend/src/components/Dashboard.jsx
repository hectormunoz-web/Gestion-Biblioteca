import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { usuario } = useAuth();

  const [totalLibros, setTotalLibros] = useState(null);
  const [librosBajoStock, setLibrosBajoStock] = useState(null);
  const [librosConStock, setLibrosConStock] = useState(null);

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

        const total = resLibros.data.length;
        const sinStock = resLibros.data.filter((l) => l.stock === 0).length;
        const conStock = resLibros.data.filter((l) => l.stock > 0).length;

        const activos = resPrestamos.data.filter(
          (p) => p.estado === "activo"
        ).length;

        const atrasados = resPrestamos.data.filter(
          (p) => p.estado === "atrasado"
        ).length;

        setTotalLibros(total);
        setLibrosBajoStock(sinStock);
        setLibrosConStock(conStock);

        setPrestamosActivos(activos);
        setPrestamosAtrasados(atrasados);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los indicadores.");
      }
    }

    cargar();
  }, []);

  const datosLibros = [
    {
      name: "Con stock",
      value: librosConStock || 0,
    },
    {
      name: "Sin stock",
      value: librosBajoStock || 0,
    },
  ];

  const datosPrestamos = [
    {
      name: "Activos",
      value: prestamosActivos || 0,
    },
    {
      name: "Atrasados",
      value: prestamosAtrasados || 0,
    },
  ];

  const coloresLibros = ["#4CAF50", "#F44336"];
  const coloresPrestamos = ["#2196F3", "#FF9800"];

  return (
    <div>
      <h1>Bienvenido, {usuario?.nombre} 👋</h1>

      {error && <div className="error-general">{error}</div>}

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Libros registrados</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>
            {totalLibros ?? "..."}
          </p>
        </div>

        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Sin existencias</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>
            {librosBajoStock ?? "..."}
          </p>
        </div>

        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Préstamos activos</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>
            {prestamosActivos ?? "..."}
          </p>
        </div>

        <div className="tarjeta" style={{ flex: "1 1 200px" }}>
          <h3 style={{ marginTop: 0 }}>Préstamos atrasados</h3>
          <p
            style={{
              fontSize: "2rem",
              margin: 0,
              color:
                prestamosAtrasados > 0
                  ? "#b3261e"
                  : "inherit",
            }}
          >
            {prestamosAtrasados ?? "..."}
          </p>
        </div>
      </div>

      {/* GRAFICAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))",
          gap: "30px",
          marginTop: "35px",
        }}
      >
        <div className="tarjeta">
          <h3 style={{ textAlign: "center" }}>
            Libros con Stock vs Sin Stock
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={datosLibros}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {datosLibros.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={coloresLibros[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="tarjeta">
          <h3 style={{ textAlign: "center" }}>
            Préstamos Activos vs Atrasados
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={datosPrestamos}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {datosPrestamos.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={coloresPrestamos[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p
        style={{
          color: "#666",
          marginTop: "30px",
        }}
      >
        El módulo de reservas y multas se habilitará en el tercer parcial.
      </p>
    </div>
  );
}
