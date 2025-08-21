import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHotel, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <FaHotel className="h-8 w-8" />
            <Link to="/" className="text-xl font-bold">
              Sistema Hotel
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/reservas" className="hover:text-blue-200 transition-colors">
              Reservas
            </Link>
            <Link to="/habitaciones" className="hover:text-blue-200 transition-colors">
              Habitaciones
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Hola, {user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
