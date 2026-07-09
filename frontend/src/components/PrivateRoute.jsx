import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, soloAdmin = false }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && usuario.rol !== "admin") {
    return (
      <div className="tarjeta">
        <h1>Acceso restringido</h1>
        <p>Esta sección solo está disponible para administradores.</p>
      </div>
    );
  }

  return children;
}
