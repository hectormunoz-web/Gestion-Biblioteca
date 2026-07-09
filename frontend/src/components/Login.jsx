import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const errores = {};
    if (!email.trim()) {
      errores.email = "El correo es obligatorio.";
    } else if (!REGEX_EMAIL.test(email.trim())) {
      errores.email = "Ingresa un correo con formato válido (ej. nombre@dominio.com).";
    }
    if (!password) {
      errores.password = "La contraseña es obligatoria.";
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
      await login(email.trim(), password);
      navigate("/");
    } catch (error) {
      setErrorGeneral(error.mensaje || "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-caja">
        <h1 style={{ fontSize: "1.4rem" }}>Biblioteca UJCV</h1>
        <p style={{ marginTop: 0, color: "#666" }}>Inicia sesión para continuar</p>

        {errorGeneral && <div className="error-general">{errorGeneral}</div>}

        <form onSubmit={manejarEnvio} noValidate>
          <div className="campo">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(erroresCampo.email)}
              aria-describedby="email-error"
            />
            {erroresCampo.email && (
              <div className="error-campo" id="email-error">{erroresCampo.email}</div>
            )}
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(erroresCampo.password)}
              aria-describedby="password-error"
            />
            {erroresCampo.password && (
              <div className="error-campo" id="password-error">{erroresCampo.password}</div>
            )}
          </div>

          <button className="btn" type="submit" disabled={enviando} style={{ width: "100%" }}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
