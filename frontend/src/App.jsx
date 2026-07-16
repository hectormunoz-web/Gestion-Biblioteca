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
import CategoriaList from "./components/categorias/CategoriaList";
import AutorList from "./components/autores/AutorList";
import PrestamoList from "./components/prestamos/PrestamoList";

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

          <Route
            path="/categorias"
            element={
              <PrivateRoute>
                <ConLayout><CategoriaList /></ConLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/autores"
            element={
              <PrivateRoute>
                <ConLayout><AutorList /></ConLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/prestamos"
            element={
              <PrivateRoute>
                <ConLayout><PrestamoList /></ConLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
