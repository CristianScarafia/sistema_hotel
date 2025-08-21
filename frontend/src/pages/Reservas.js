import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reservasService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await reservasService.getAll();
      setReservas(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar las reservas');
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
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <FaPlus className="h-4 w-4" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {reservas.map((reserva) => (
            <li key={reserva.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Habitación {reserva.habitacion_numero || reserva.habitacion?.numero}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {new Date(reserva.fecha_ingreso).toLocaleDateString()} - {new Date(reserva.fecha_egreso).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      ${parseFloat(reserva.monto_total).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEye className="h-4 w-4" />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800">
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Reservas;
