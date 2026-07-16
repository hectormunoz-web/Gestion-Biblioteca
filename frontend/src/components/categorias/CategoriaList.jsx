import { useEffect, useState } from "react";
import api from "../../api";
import ConfirmModal from "../ConfirmModal";
import { useAuth } from "../../context/AuthContext";

export default function CategoriaList() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [aEliminar, setAEliminar] = useState(null);

  const [nombreNuevo, setNombreNuevo] = useState("");
  const [errorNuevo, setErrorNuevo] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [errorEditado, setErrorEditado] = useState("");

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get("/categorias");
      setCategorias(data);
    } catch (err) {
      setError(err.mensaje || "No se pudo cargar la lista de categorías.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearCategoria(evento) {
    evento.preventDefault();
    setErrorNuevo("");

    const nombre = nombreNuevo.trim();
    if (!nombre) {
      setErrorNuevo("El nombre es obligatorio.");
      return;
    }
    if (nombre.length < 2 || nombre.length > 80) {
      setErrorNuevo("El nombre debe tener entre 2 y 80 caracteres.");
      return;
    }

    try {
      await api.post("/categorias", { nombre });
      setNombreNuevo("");
      cargar();
    } catch (err) {
      setErrorNuevo(err.mensaje || "No se pudo crear la categoría.");
    }
  }

  function iniciarEdicion(categoria) {
    setEditandoId(categoria.id);
    setNombreEditado(categoria.nombre);
    setErrorEditado("");
  }

  async function guardarEdicion(id) {
    setErrorEditado("");
    const nombre = nombreEditado.trim();
    if (!nombre || nombre.length < 2 || nombre.length > 80) {
      setErrorEditado("El nombre debe tener entre 2 y 80 caracteres.");
      return;
    }
    try {
      await api.put(`/categorias/${id}`, { nombre });
      setEditandoId(null);
      cargar();
    } catch (err) {
      setErrorEditado(err.mensaje || "No se pudo actualizar la categoría.");
    }
  }

  async function confirmarEliminacion() {
    try {
      await api.delete(`/categorias/${aEliminar.id}`);
      setAEliminar(null);
      cargar();
    } catch (err) {
      setError(err.mensaje || "No se pudo eliminar la categoría.");
      setAEliminar(null);
    }
  }

  return (
    <div>
      <h1>Categorías</h1>
      {error && <div className="error-general">{error}</div>}

      {usuario?.rol === "admin" && (
        <div className="tarjeta">
          <h3 style={{ marginTop: 0 }}>Nueva categoría</h3>
          <form onSubmit={crearCategoria} noValidate style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div className="campo" style={{ flex: 1, marginBottom: 0 }}>
              <input
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                placeholder="Ej. Ciencia Ficción"
                aria-invalid={Boolean(errorNuevo)}
              />
              {errorNuevo && <div className="error-campo">{errorNuevo}</div>}
            </div>
            <button className="btn" type="submit">Agregar</button>
          </form>
        </div>
      )}

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : categorias.length === 0 ? (
          <p>No hay categorías registradas todavía.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                {usuario?.rol === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>
                    {editandoId === c.id ? (
                      <>
                        <input
                          value={nombreEditado}
                          onChange={(e) => setNombreEditado(e.target.value)}
                          aria-invalid={Boolean(errorEditado)}
                        />
                        {errorEditado && <div className="error-campo">{errorEditado}</div>}
                      </>
                    ) : (
                      c.nombre
                    )}
                  </td>
                  {usuario?.rol === "admin" && (
                    <td className="acciones-tabla">
                      {editandoId === c.id ? (
                        <>
                          <button className="btn" onClick={() => guardarEdicion(c.id)}>Guardar</button>
                          <button className="btn btn-secundario" onClick={() => setEditandoId(null)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secundario" onClick={() => iniciarEdicion(c)}>
                            Editar
                          </button>
                          <button className="btn btn-peligro" onClick={() => setAEliminar(c)}>
                            Eliminar
                          </button>
                        </>
                      )}
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
          titulo="Eliminar categoría"
          mensaje={`¿Seguro que deseas eliminar "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
