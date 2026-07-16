import { useEffect, useState } from "react";
import api from "../../api";
import ConfirmModal from "../ConfirmModal";
import { useAuth } from "../../context/AuthContext";

const ETIQUETAS_ESTADO = {
  activo: { texto: "Activo", clase: "etiqueta-activo" },
  atrasado: { texto: "Atrasado", clase: "etiqueta-inactivo" },
  devuelto: { texto: "Devuelto", clase: "etiqueta-miembro" },
};

export default function PrestamoList() {
  const { usuario } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [libros, setLibros] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState({ usuario_id: "", libro_id: "" });
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [aDevolver, setADevolver] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const peticiones = [api.get("/prestamos"), api.get("/libros")];
      if (usuario?.rol === "admin") peticiones.push(api.get("/usuarios"));

      const respuestas = await Promise.all(peticiones);
      setPrestamos(respuestas[0].data);
      setLibros(respuestas[1].data);
      if (respuestas[2]) setUsuarios(respuestas[2].data);
    } catch (err) {
      setError(err.mensaje || "No se pudo cargar la información de préstamos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validar() {
    const errores = {};
    if (!form.usuario_id) errores.usuario_id = "Selecciona un usuario.";
    if (!form.libro_id) errores.libro_id = "Selecciona un libro.";
    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function crearPrestamo(evento) {
    evento.preventDefault();
    setErrorGeneral("");
    if (!validar()) return;

    setEnviando(true);
    try {
      await api.post("/prestamos", {
        usuario_id: Number(form.usuario_id),
        libro_id: Number(form.libro_id),
      });
      setForm({ usuario_id: "", libro_id: "" });
      cargar();
    } catch (err) {
      setErrorGeneral(err.mensaje || "No se pudo registrar el préstamo.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarDevolucion() {
    try {
      await api.put(`/prestamos/${aDevolver.id}/devolver`);
      setADevolver(null);
      cargar();
    } catch (err) {
      setError(err.mensaje || "No se pudo registrar la devolución.");
      setADevolver(null);
    }
  }

  const librosConStock = libros.filter((l) => l.stock > 0);

  return (
    <div>
      <h1>Préstamos</h1>
      {error && <div className="error-general">{error}</div>}

      {usuario?.rol === "admin" && (
        <div className="tarjeta">
          <h3 style={{ marginTop: 0 }}>Nuevo préstamo</h3>
          {errorGeneral && <div className="error-general">{errorGeneral}</div>}
          <form onSubmit={crearPrestamo} noValidate style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div className="campo" style={{ flex: 1, marginBottom: 0 }}>
              <select
                value={form.usuario_id}
                onChange={(e) => setForm((p) => ({ ...p, usuario_id: e.target.value }))}
                aria-invalid={Boolean(erroresCampo.usuario_id)}
              >
                <option value="">Selecciona un usuario</option>
                {usuarios.filter((u) => u.activo).map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
              {erroresCampo.usuario_id && <div className="error-campo">{erroresCampo.usuario_id}</div>}
            </div>

            <div className="campo" style={{ flex: 1, marginBottom: 0 }}>
              <select
                value={form.libro_id}
                onChange={(e) => setForm((p) => ({ ...p, libro_id: e.target.value }))}
                aria-invalid={Boolean(erroresCampo.libro_id)}
              >
                <option value="">Selecciona un libro (con existencias)</option>
                {librosConStock.map((l) => (
                  <option key={l.id} value={l.id}>{l.titulo} (stock: {l.stock})</option>
                ))}
              </select>
              {erroresCampo.libro_id && <div className="error-campo">{erroresCampo.libro_id}</div>}
            </div>

            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Prestar"}
            </button>
          </form>
          <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 0 }}>
            El plazo de devolución se calcula automáticamente a 15 días desde hoy.
          </p>
        </div>
      )}

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : prestamos.length === 0 ? (
          <p>No hay préstamos registrados todavía.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Libro</th>
                <th>Fecha préstamo</th>
                <th>Fecha esperada</th>
                <th>Estado</th>
                {usuario?.rol === "admin" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {prestamos.map((p) => {
                const etiqueta = ETIQUETAS_ESTADO[p.estado] || { texto: p.estado, clase: "" };
                return (
                  <tr key={p.id}>
                    <td>{p.usuario_nombre}</td>
                    <td>{p.libro_titulo}</td>
                    <td>{p.fecha_prestamo}</td>
                    <td>{p.fecha_devolucion_esperada}</td>
                    <td><span className={`etiqueta ${etiqueta.clase}`}>{etiqueta.texto}</span></td>
                    {usuario?.rol === "admin" && (
                      <td className="acciones-tabla">
                        {p.estado !== "devuelto" && (
                          <button className="btn btn-secundario" onClick={() => setADevolver(p)}>
                            Marcar devuelto
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {aDevolver && (
        <ConfirmModal
          titulo="Registrar devolución"
          mensaje={`¿Confirmas que "${aDevolver.libro_titulo}" fue devuelto por ${aDevolver.usuario_nombre}?`}
          onConfirmar={confirmarDevolucion}
          onCancelar={() => setADevolver(null)}
        />
      )}
    </div>
  );
}
