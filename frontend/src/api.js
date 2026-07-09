import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza los errores del backend a un formato consistente:
// { mensaje: string, detalles: { campo: [mensajes] } | null }
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const data = error.response?.data;
    const normalizado = {
      mensaje: data?.error || "No se pudo conectar con el servidor. Intenta de nuevo.",
      detalles: data?.detalles || null,
      status: error.response?.status,
    };
    return Promise.reject(normalizado);
  }
);

export default api;
