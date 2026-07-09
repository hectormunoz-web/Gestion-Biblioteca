import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import ConfirmModal from "../ConfirmModal";
import { useAuth } from "../../context/AuthContext";

export default function LibroList() {
  const { usuario } = useAuth();
  const [libros, setLibros] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [aEliminar, setAEliminar] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get("/libros");
      setLibros(data);
    } catch (err) {
      setError(err.mensaje || "No se pudo cargar la lista de libros.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarEliminacion() {
    try {
      await api.delete(`/libros/${aEliminar.id}`);
      setAEliminar(null);
      cargar();
    } catch (err) {
      setError(err.mensaje || "No se pudo eliminar el libro.");
      setAEliminar(null);
    }
  }

  return (
    <div>
      <div className="encabezado-lista">
        <h1>Libros</h1>
        {usuario?.rol === "admin" && (
          <Link to="/libros/nuevo" className="btn" style={{ textDecoration: "none" }}>
            + Nuevo libro
          </Link>
        )}
      </div>

      {error && <div className="error-general">{error}</div>}

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : libros.length === 0 ? (
          <p>No hay libros registrados todavía.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>ISBN</th>
                <th>Categoría</th>
                <th>Autores</th>
                <th>Stock</th>
                {usuario?.rol === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {libros.map((l) => (
                <tr key={l.id}>
                  <td>{l.titulo}</td>
                  <td>{l.isbn}</td>
                  <td>{l.categoria}</td>
                  <td>{l.autores.map((a) => a.nombre).join(", ")}</td>
                  <td>{l.stock}</td>
                  {usuario?.rol === "admin" && (
                    <td className="acciones-tabla">
                      <Link to={`/libros/${l.id}/editar`} className="btn btn-secundario">
                        Editar
                      </Link>
                      <button className="btn btn-peligro" onClick={() => setAEliminar(l)}>
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {aEliminar && (
        <ConfirmModal
          titulo="Eliminar libro"
          mensaje={`¿Seguro que deseas eliminar "${aEliminar.titulo}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
