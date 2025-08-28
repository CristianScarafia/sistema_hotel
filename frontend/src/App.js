import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { debugApiConfig } from './utils/debug';

// Componentes
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Habitaciones from './pages/Habitaciones';
import EntradasSalidas from './pages/EntradasSalidas';
import Login from './pages/Login';
import Planning from './pages/Planning';
import OcupacionLimpieza from './pages/OcupacionLimpieza';
import Usuarios from './pages/Usuarios';
import Estadisticas from './pages/Estadisticas';
import Configuracion from './pages/Configuracion';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  useEffect(() => {
    // Debug de configuración de API
    debugApiConfig();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas con Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reservas" element={
            <ProtectedRoute>
              <Layout>
                <Reservas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/habitaciones" element={
            <ProtectedRoute>
              <Layout>
                <Habitaciones />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/entradas-salidas" element={
            <ProtectedRoute>
              <Layout>
                <EntradasSalidas />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/planning" element={
            <ProtectedRoute>
              <Layout>
                <Planning />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/ocupacion-limpieza" element={
            <ProtectedRoute>
              <Layout>
                <OcupacionLimpieza />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <RoleProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <Usuarios />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path="/estadisticas" element={
            <RoleProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <Estadisticas />
              </Layout>
            </RoleProtectedRoute>
          } />
          <Route path="/configuracion" element={
            <RoleProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <Configuracion />
              </Layout>
            </RoleProtectedRoute>
          } />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
