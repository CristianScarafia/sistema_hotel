import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Obtener el rol del usuario
  const userRole = user?.perfil?.rol || 'conserge';

  // Verificar si el usuario tiene el rol permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirigir al dashboard si no tiene permisos
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
