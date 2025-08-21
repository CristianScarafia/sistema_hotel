import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Habitaciones from './pages/Habitaciones';
import EntradasSalidas from './pages/EntradasSalidas';
import Login from './pages/Login';
import Planning from './pages/Planning';
import Usuarios from './pages/Usuarios';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
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
          <Route path="/usuarios" element={
            <ProtectedRoute>
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
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
