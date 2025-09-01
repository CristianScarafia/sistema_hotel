import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import api, { setCsrfToken } from '../services/api';

// Helper para obtener la URL base de la API
const getApiUrl = () => {
  // En Railway, usar la variable de entorno REACT_APP_API_URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', ''); // Remover /api para que sea la base URL
  }
  
  // En desarrollo local
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // Fallback por defecto
  return '';
};

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

  // Usar la instancia compartida configurada en services/api.js

  const getUserProfile = useCallback(async (userData) => {
    try {
      const profileResponse = await api.get('/perfiles/mi-perfil/');
      return {
        ...userData,
        perfil: profileResponse.data
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        ...userData,
        perfil: { 
          rol: (userData.is_superuser || userData.is_staff) ? 'supervisor' : 'conserge', 
          turno: 'mañana',
          telefono: '123456789',
          direccion: 'Dirección del administrador'
        }
      };
    }
  }, [api]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('=== CHECKING AUTH STATUS ===');
      const response = await api.get('/auth/');
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
  }, [api, getUserProfile]);

  useEffect(() => {
    // Bootstrap CSRF para dominios cruzados
    (async () => {
      try {
        console.log('🔒 Obteniendo token CSRF...');
        const resp = await api.get('/csrf/');
        // Preferir el valor de la cookie real para evitar desincronización
        const tokenFromCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        const token = tokenFromCookie || resp?.data?.csrftoken;
        if (token) {
          setCsrfToken(token);
          console.log('✅ Token CSRF obtenido');
        } else {
          console.warn('⚠️ CSRF sin token en cookie ni respuesta');
        }
      } catch (e) {
        console.warn('⚠️ No se pudo obtener CSRF inicialmente:', e.response?.data || e.message);
      } finally {
        checkAuthStatus();
      }
    })();
  }, [api, checkAuthStatus]);

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      // Refrescar CSRF desde cookie justo antes del POST
      const tokenFromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      if (tokenFromCookie) {
        setCsrfToken(tokenFromCookie);
      }
      const response = await api.post('/auth/', credentials);
      console.log('Login response:', response.data);
      // Obtener información del perfil del usuario
      const userWithProfile = await getUserProfile(response.data.user);
      setUser(userWithProfile);
      // Tras login, Django puede rotar el CSRF. Sincronizar encabezado con nueva cookie
      try {
        const newToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        if (newToken) {
          setCsrfToken(newToken);
        } else {
          await api.get('/csrf/');
          const refreshed = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
          if (refreshed) setCsrfToken(refreshed);
        }
      } catch (e) {
        console.warn('No se pudo refrescar CSRF post-login:', e);
      }
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
      await api.delete('/auth/');
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
