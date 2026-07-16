import { useEffect, useState } from "react";
import api from "../../api";
import ConfirmModal from "../ConfirmModal";
import { useAuth } from "../../context/AuthContext";

export default function AutorList() {
  const { usuario } = useAuth();
  const [autores, setAutores] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [aEliminar, setAEliminar] = useState(null);

  const [form, setForm] = useState({ nombre: "", nacionalidad: "" });
  const [errorForm, setErrorForm] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [formEditado, setFormEditado] = useState({ nombre: "", nacionalidad: "" });
  const [errorEditado, setErrorEditado] = useState("");

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get("/autores");
      setAutores(data);
    } catch (err) {
      setError(err.mensaje || "No se pudo cargar la lista de autores.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearAutor(evento) {
    evento.preventDefault();
    setErrorForm("");

    const nombre = form.nombre.trim();
    if (!nombre || nombre.length < 2 || nombre.length > 150) {
      setErrorForm("El nombre debe tener entre 2 y 150 caracteres.");
      return;
    }

    try {
      await api.post("/autores", {
        nombre,
        nacionalidad: form.nacionalidad.trim() || null,
      });
      setForm({ nombre: "", nacionalidad: "" });
      cargar();
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo crear el autor.");
    }
  }

  function iniciarEdicion(autor) {
    setEditandoId(autor.id);
    setFormEditado({ nombre: autor.nombre, nacionalidad: autor.nacionalidad || "" });
    setErrorEditado("");
  }

  async function guardarEdicion(id) {
    setErrorEditado("");
    const nombre = formEditado.nombre.trim();
    if (!nombre || nombre.length < 2 || nombre.length > 150) {
      setErrorEditado("El nombre debe tener entre 2 y 150 caracteres.");
      return;
    }
    try {
      await api.put(`/autores/${id}`, {
        nombre,
        nacionalidad: formEditado.nacionalidad.trim() || null,
      });
      setEditandoId(null);
      cargar();
    } catch (err) {
      setErrorEditado(err.mensaje || "No se pudo actualizar el autor.");
    }
  }

  async function confirmarEliminacion() {
    try {
      await api.delete(`/autores/${aEliminar.id}`);
      setAEliminar(null);
      cargar();
    } catch (err) {
      setError(err.mensaje || "No se pudo eliminar el autor.");
      setAEliminar(null);
    }
  }

  return (
    <div>
      <h1>Autores</h1>
      {error && <div className="error-general">{error}</div>}

      {usuario?.rol === "admin" && (
        <div className="tarjeta">
          <h3 style={{ marginTop: 0 }}>Nuevo autor</h3>
          <form onSubmit={crearAutor} noValidate style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div className="campo" style={{ flex: 1, marginBottom: 0 }}>
              <input
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            <div className="campo" style={{ flex: 1, marginBottom: 0 }}>
              <input
                value={form.nacionalidad}
                onChange={(e) => setForm((p) => ({ ...p, nacionalidad: e.target.value }))}
                placeholder="Nacionalidad (opcional)"
              />
            </div>
            <button className="btn" type="submit">Agregar</button>
          </form>
          {errorForm && <div className="error-campo" style={{ marginTop: 8 }}>{errorForm}</div>}
        </div>
      )}

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : autores.length === 0 ? (
          <p>No hay autores registrados todavía.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Nacionalidad</th>
                {usuario?.rol === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {autores.map((a) => (
                <tr key={a.id}>
                  {editandoId === a.id ? (
                    <>
                      <td>
                        <input
                          value={formEditado.nombre}
                          onChange={(e) => setFormEditado((p) => ({ ...p, nombre: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          value={formEditado.nacionalidad}
                          onChange={(e) => setFormEditado((p) => ({ ...p, nacionalidad: e.target.value }))}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{a.nombre}</td>
                      <td>{a.nacionalidad || "—"}</td>
                    </>
                  )}
                  {usuario?.rol === "admin" && (
                    <td className="acciones-tabla">
                      {editandoId === a.id ? (
                        <>
                          <button className="btn" onClick={() => guardarEdicion(a.id)}>Guardar</button>
                          <button className="btn btn-secundario" onClick={() => setEditandoId(null)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-secundario" onClick={() => iniciarEdicion(a)}>
                            Editar
                          </button>
                          <button className="btn btn-peligro" onClick={() => setAEliminar(a)}>
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
        {errorEditado && <div className="error-campo" style={{ marginTop: 8 }}>{errorEditado}</div>}
      </div>

      {aEliminar && (
        <ConfirmModal
          titulo="Eliminar autor"
          mensaje={`¿Seguro que deseas eliminar a "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
