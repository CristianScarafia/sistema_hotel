import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurar axios con credenciales y URL base
  const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
  });

  // Configurar interceptor para manejar CSRF
  api.interceptors.request.use(
    (config) => {
      // Obtener el token CSRF de las cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/api/auth/');
      setUser(response.data);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/api/auth/', credentials);
      console.log('Login response:', response.data);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Error de autenticación' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.delete('/api/auth/');
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
