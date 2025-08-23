import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  }, [checkAuthStatus]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('=== CHECKING AUTH STATUS ===');
      const response = await api.get('/api/auth/');
      console.log('Auth response:', response.data);
      // Obtener información del perfil del usuario
      const userWithProfile = await getUserProfile(response.data);
      console.log('User with profile:', userWithProfile);
      setUser(userWithProfile);
    } catch (error) {
      console.error('Error checking auth status:', error);
      console.error('Error details:', error.response?.data);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserProfile = async (userData) => {
    try {
      const profileResponse = await api.get('/api/perfiles/mi-perfil/');
      return {
        ...userData,
        perfil: profileResponse.data
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        ...userData,
        perfil: { rol: 'conserge', turno: 'mañana' }
      };
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/api/auth/', credentials);
      console.log('Login response:', response.data);
      // Obtener información del perfil del usuario
      const userWithProfile = await getUserProfile(response.data.user);
      setUser(userWithProfile);
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
