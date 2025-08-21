import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { habitacionesService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaBed } from 'react-icons/fa';

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabitaciones();
  }, []);

  const loadHabitaciones = async () => {
    try {
      setLoading(true);
      const response = await habitacionesService.getAll();
      setHabitaciones(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar las habitaciones');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Habitaciones</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <FaPlus className="h-4 w-4" />
          <span>Nueva Habitación</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.map((habitacion) => (
          <div key={habitacion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaBed className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Habitación {habitacion.numero}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Piso {habitacion.piso} • {habitacion.tipo_display || habitacion.tipo}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Habitaciones;
