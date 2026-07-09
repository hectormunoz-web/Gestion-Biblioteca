import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const ANIO_ACTUAL = new Date().getFullYear();

export default function LibroForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: "",
    isbn: "",
    categoria_id: "",
    editorial: "",
    anio_publicacion: "",
    stock: "0",
    autor_ids: [],
  });
  const [categorias, setCategorias] = useState([]);
  const [autores, setAutores] = useState([]);
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resCategorias, resAutores] = await Promise.all([
          api.get("/categorias"),
          api.get("/autores"),
        ]);
        setCategorias(resCategorias.data);
        setAutores(resAutores.data);

        if (esEdicion) {
          const { data } = await api.get(`/libros/${id}`);
          setForm({
            titulo: data.titulo,
            isbn: data.isbn,
            categoria_id: String(data.categoria_id),
            editorial: data.editorial || "",
            anio_publicacion: data.anio_publicacion ? String(data.anio_publicacion) : "",
            stock: String(data.stock),
            autor_ids: data.autores.map((a) => a.id),
          });
        }
      } catch (err) {
        setErrorGeneral(err.mensaje || "No se pudieron cargar los datos del formulario.");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, [id, esEdicion]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function alternarAutor(autorId) {
    setForm((prev) => {
      const yaSeleccionado = prev.autor_ids.includes(autorId);
      return {
        ...prev,
        autor_ids: yaSeleccionado
          ? prev.autor_ids.filter((idAutor) => idAutor !== autorId)
          : [...prev.autor_ids, autorId],
      };
    });
  }

  function validar() {
    const errores = {};
    const isbnLimpio = form.isbn.replace(/[-\s]/g, "");

    if (!form.titulo.trim()) {
      errores.titulo = "El título es obligatorio.";
    }

    if (!form.isbn.trim()) {
      errores.isbn = "El ISBN es obligatorio.";
    } else if (!/^\d+$/.test(isbnLimpio) || ![10, 13].includes(isbnLimpio.length)) {
      errores.isbn = "El ISBN debe tener 10 o 13 dígitos (guiones opcionales).";
    }

    if (!form.categoria_id) {
      errores.categoria_id = "Selecciona una categoría.";
    }

    if (form.autor_ids.length === 0) {
      errores.autor_ids = "Selecciona al menos un autor.";
    }

    if (form.anio_publicacion) {
      const anio = Number(form.anio_publicacion);
      if (!Number.isInteger(anio) || anio < 1400 || anio > ANIO_ACTUAL + 1) {
        errores.anio_publicacion = `El año debe estar entre 1400 y ${ANIO_ACTUAL + 1}.`;
      }
    }

    const stock = Number(form.stock);
    if (form.stock === "" || !Number.isInteger(stock) || stock < 0) {
      errores.stock = "El stock debe ser un número entero mayor o igual a 0.";
    }

    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral("");
    if (!validar()) return;

    setEnviando(true);
    const payload = {
      titulo: form.titulo.trim(),
      isbn: form.isbn.trim(),
      categoria_id: Number(form.categoria_id),
      editorial: form.editorial.trim() || null,
      anio_publicacion: form.anio_publicacion ? Number(form.anio_publicacion) : null,
      stock: Number(form.stock),
      autor_ids: form.autor_ids,
    };

    try {
      if (esEdicion) {
        await api.put(`/libros/${id}`, payload);
      } else {
        await api.post("/libros", payload);
      }
      navigate("/libros");
    } catch (err) {
      if (err.detalles) {
        const errores = {};
        Object.entries(err.detalles).forEach(([campo, mensajes]) => {
          errores[campo] = Array.isArray(mensajes) ? mensajes[0] : mensajes;
        });
        setErroresCampo(errores);
      }
      setErrorGeneral(err.mensaje || "No se pudo guardar el libro.");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{esEdicion ? "Editar libro" : "Nuevo libro"}</h1>
      <div className="tarjeta" style={{ maxWidth: 560 }}>
        {errorGeneral && <div className="error-general">{errorGeneral}</div>}

        <form onSubmit={manejarEnvio} noValidate>
          <div className="campo">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              value={form.titulo}
              onChange={(e) => actualizarCampo("titulo", e.target.value)}
              aria-invalid={Boolean(erroresCampo.titulo)}
            />
            {erroresCampo.titulo && <div className="error-campo">{erroresCampo.titulo}</div>}
          </div>

          <div className="campo">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              value={form.isbn}
              onChange={(e) => actualizarCampo("isbn", e.target.value)}
              aria-invalid={Boolean(erroresCampo.isbn)}
              placeholder="Ej. 9780307474728"
            />
            {erroresCampo.isbn && <div className="error-campo">{erroresCampo.isbn}</div>}
          </div>

          <div className="campo">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              value={form.categoria_id}
              onChange={(e) => actualizarCampo("categoria_id", e.target.value)}
              aria-invalid={Boolean(erroresCampo.categoria_id)}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {erroresCampo.categoria_id && (
              <div className="error-campo">{erroresCampo.categoria_id}</div>
            )}
          </div>

          <div className="campo">
            <label>Autores</label>
            <div className="checklist-autores">
              {autores.map((a) => (
                <label key={a.id}>
                  <input
                    type="checkbox"
                    checked={form.autor_ids.includes(a.id)}
                    onChange={() => alternarAutor(a.id)}
                  />
                  {a.nombre}
                </label>
              ))}
            </div>
            {erroresCampo.autor_ids && <div className="error-campo">{erroresCampo.autor_ids}</div>}
          </div>

          <div className="campo">
            <label htmlFor="editorial">Editorial (opcional)</label>
            <input
              id="editorial"
              value={form.editorial}
              onChange={(e) => actualizarCampo("editorial", e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="anio">Año de publicación (opcional)</label>
            <input
              id="anio"
              type="number"
              value={form.anio_publicacion}
              onChange={(e) => actualizarCampo("anio_publicacion", e.target.value)}
              aria-invalid={Boolean(erroresCampo.anio_publicacion)}
            />
            {erroresCampo.anio_publicacion && (
              <div className="error-campo">{erroresCampo.anio_publicacion}</div>
            )}
          </div>

          <div className="campo">
            <label htmlFor="stock">Stock disponible</label>
            <input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => actualizarCampo("stock", e.target.value)}
              aria-invalid={Boolean(erroresCampo.stock)}
            />
            {erroresCampo.stock && <div className="error-campo">{erroresCampo.stock}</div>}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="btn btn-secundario" onClick={() => navigate("/libros")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
