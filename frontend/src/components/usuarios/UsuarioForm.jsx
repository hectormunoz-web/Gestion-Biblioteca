import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UsuarioForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "miembro",
    activo: true,
  });
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(esEdicion);

  useEffect(() => {
    if (!esEdicion) return;
    async function cargar() {
      try {
        const { data } = await api.get(`/usuarios/${id}`);
        setForm({
          nombre: data.nombre,
          email: data.email,
          password: "",
          rol: data.rol,
          activo: data.activo,
        });
      } catch (err) {
        setErrorGeneral(err.mensaje || "No se pudo cargar el usuario.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id, esEdicion]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function validar() {
    const errores = {};

    if (!form.nombre.trim()) {
      errores.nombre = "El nombre es obligatorio.";
    } else if (form.nombre.trim().length < 2 || form.nombre.trim().length > 120) {
      errores.nombre = "El nombre debe tener entre 2 y 120 caracteres.";
    }

    if (!form.email.trim()) {
      errores.email = "El correo es obligatorio.";
    } else if (!REGEX_EMAIL.test(form.email.trim())) {
      errores.email = "Ingresa un correo con formato válido.";
    }

    if (!esEdicion && !form.password) {
      errores.password = "La contraseña es obligatoria.";
    } else if (form.password && form.password.length < 8) {
      errores.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral("");
    if (!validar()) return;

    setEnviando(true);
    try {
      if (esEdicion) {
        const payload = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          rol: form.rol,
          activo: form.activo,
        };
        if (form.password) payload.password = form.password;
        await api.put(`/usuarios/${id}`, payload);
      } else {
        await api.post("/usuarios", {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        });
      }
      navigate("/usuarios");
    } catch (err) {
      if (err.detalles) {
        const errores = {};
        Object.entries(err.detalles).forEach(([campo, mensajes]) => {
          errores[campo] = Array.isArray(mensajes) ? mensajes[0] : mensajes;
        });
        setErroresCampo(errores);
      }
      setErrorGeneral(err.mensaje || "No se pudo guardar el usuario.");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</h1>
      <div className="tarjeta" style={{ maxWidth: 480 }}>
        {errorGeneral && <div className="error-general">{errorGeneral}</div>}

        <form onSubmit={manejarEnvio} noValidate>
          <div className="campo">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              aria-invalid={Boolean(erroresCampo.nombre)}
            />
            {erroresCampo.nombre && <div className="error-campo">{erroresCampo.nombre}</div>}
          </div>

          <div className="campo">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => actualizarCampo("email", e.target.value)}
              aria-invalid={Boolean(erroresCampo.email)}
            />
            {erroresCampo.email && <div className="error-campo">{erroresCampo.email}</div>}
          </div>

          <div className="campo">
            <label htmlFor="password">
              {esEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => actualizarCampo("password", e.target.value)}
              aria-invalid={Boolean(erroresCampo.password)}
              placeholder={esEdicion ? "Dejar en blanco para no cambiarla" : ""}
            />
            {erroresCampo.password && <div className="error-campo">{erroresCampo.password}</div>}
          </div>

          <div className="campo">
            <label htmlFor="rol">Rol</label>
            <select id="rol" value={form.rol} onChange={(e) => actualizarCampo("rol", e.target.value)}>
              <option value="miembro">Miembro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {esEdicion && (
            <div className="campo">
              <label htmlFor="activo">Estado</label>
              <select
                id="activo"
                value={form.activo ? "true" : "false"}
                onChange={(e) => actualizarCampo("activo", e.target.value === "true")}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              className="btn btn-secundario"
              onClick={() => navigate("/usuarios")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
