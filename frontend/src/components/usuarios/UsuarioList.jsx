import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import ConfirmModal from "../ConfirmModal";

export default function UsuarioList() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [aEliminar, setAEliminar] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch (err) {
      setError(err.mensaje || "No se pudo cargar la lista de usuarios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarEliminacion() {
    try {
      await api.delete(`/usuarios/${aEliminar.id}`);
      setAEliminar(null);
      cargar();
    } catch (err) {
      setError(err.mensaje || "No se pudo eliminar el usuario.");
      setAEliminar(null);
    }
  }

  return (
    <div>
      <div className="encabezado-lista">
        <h1>Usuarios</h1>
        <Link to="/usuarios/nuevo" className="btn" style={{ textDecoration: "none" }}>
          + Nuevo usuario
        </Link>
      </div>

      {error && <div className="error-general">{error}</div>}

      <div className="tarjeta">
        {cargando ? (
          <p>Cargando...</p>
        ) : usuarios.length === 0 ? (
          <p>No hay usuarios registrados todavía.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`etiqueta ${u.rol === "admin" ? "etiqueta-admin" : "etiqueta-miembro"}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`etiqueta ${u.activo ? "etiqueta-activo" : "etiqueta-inactivo"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="acciones-tabla">
                    <Link to={`/usuarios/${u.id}/editar`} className="btn btn-secundario">
                      Editar
                    </Link>
                    <button className="btn btn-peligro" onClick={() => setAEliminar(u)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {aEliminar && (
        <ConfirmModal
          titulo="Eliminar usuario"
          mensaje={`¿Seguro que deseas eliminar a "${aEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
