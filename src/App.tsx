// Libraries
import { Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AlertProvider } from './context/AlertContext';

// Components
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProteccionRuta';
import { HomePage } from './components/pages/ HomePage';
import { ProductosPage } from './components/pages/productos/ProductosPage';
import { CategoriasPage } from './components/pages/categorias/CategoriasPage';
import { UsuariosPage } from './components/pages/usuarios/ UsuariosPages';
import { ClientesPage } from './components/pages/clientes/ClientesPage';
import { OrdenesPage } from './components/pages/ordenes/OrdenesPage';
import { EstadosOrdenPage } from './components/pages/estadosOrdenes/EstadosOrdenes';
import { InformacionPage } from './components/pages/informacion/InformacionPage';
import { LoginPage } from './components/pages/auth/LoginPage';
import { RegisterPage } from './components/pages/auth/RegistroPage';

export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/productos" element={<ProductosPage />} />
                  <Route path="/categorias" element={<CategoriasPage />} />
                  <Route path="/usuarios" element={<UsuariosPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/ordenes" element={<OrdenesPage />} />
                  <Route path="/estados-orden" element={<EstadosOrdenPage />} />
                  <Route path="/informacion" element={<InformacionPage />} />
                </Route>
              </Route>
            </Routes>
        </CartProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
