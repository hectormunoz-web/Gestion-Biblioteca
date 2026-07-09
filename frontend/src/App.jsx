import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UsuarioList from "./components/usuarios/UsuarioList";
import UsuarioForm from "./components/usuarios/UsuarioForm";
import LibroList from "./components/libros/LibroList";
import LibroForm from "./components/libros/LibroForm";

function ConLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <ConLayout><Dashboard /></ConLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <PrivateRoute soloAdmin>
                <ConLayout><UsuarioList /></ConLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios/nuevo"
            element={
              <PrivateRoute soloAdmin>
                <ConLayout><UsuarioForm /></ConLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios/:id/editar"
            element={
              <PrivateRoute soloAdmin>
                <ConLayout><UsuarioForm /></ConLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/libros"
            element={
              <PrivateRoute>
                <ConLayout><LibroList /></ConLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/libros/nuevo"
            element={
              <PrivateRoute soloAdmin>
                <ConLayout><LibroForm /></ConLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/libros/:id/editar"
            element={
              <PrivateRoute soloAdmin>
                <ConLayout><LibroForm /></ConLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
