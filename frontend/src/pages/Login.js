import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaHotel, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(credentials);
      if (result.success) {
        toast.success('Login exitoso');
        navigate('/');
      } else {
        toast.error(result.error || 'Error de autenticación');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 animate-[pulse_12s_ease-in-out_infinite] opacity-90" />
      {/* Círculos borrosos decorativos */}
      <div className="absolute -top-20 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-10 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

      {/* Contenido */}
      <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card glassmorphism */}
          <div className="backdrop-blur-xl bg-white/10 ring-1 ring-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 shadow-lg">
                <FaHotel className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                Sistema Hotel
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Inicia sesión para continuar
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative group">
                  <div className="w-full flex items-center h-12 rounded-xl bg-white/10 ring-1 ring-inset ring-white/20 focus-within:ring-2 focus-within:ring-white/50 transition">
                    <div className="w-12 flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      className="flex-1 h-full py-0 bg-transparent !border-0 outline-none ring-0 focus:ring-0 focus:outline-none text-base text-white placeholder-white/60 px-0 pr-3"
                      placeholder="Usuario"
                      value={credentials.username}
                      onChange={handleChange}
                      aria-label="Usuario"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <div className="w-full flex items-center h-12 rounded-xl bg-white/10 ring-1 ring-inset ring-white/20 focus-within:ring-2 focus-within:ring-white/50 transition">
                    <div className="w-12 flex items-center justify-center">
                      <FaLock className="h-5 w-5 text-white/70" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="flex-1 h-full py-0 bg-transparent !border-0 outline-none ring-0 focus:ring-0 focus:outline-none text-base text-white placeholder-white/60 px-0"
                      placeholder="Contraseña"
                      value={credentials.password}
                      onChange={handleChange}
                      aria-label="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="w-12 flex items-center justify-center text-white/80 hover:text-white"
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-700 font-semibold text-base shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-[1px] transition disabled:opacity-60"
              >
                {loading && (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-indigo-600 border-r-transparent animate-spin" />
                )}
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              <div className="text-center">
                <p className="text-xs text-white/70">
                  © {new Date().getFullYear()} Sistema Hotel
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
