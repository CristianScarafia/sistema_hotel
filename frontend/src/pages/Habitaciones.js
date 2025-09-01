import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { habitacionesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaBed, FaEye } from 'react-icons/fa';

const Habitaciones = () => {
  const { user } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'doble',
    piso: 'planta baja'
  });

  // Opciones para los selects
  const opcionesTipo = [
    { value: 'doble', label: 'Doble' },
    { value: 'simple', label: 'Simple' },
    { value: 'triple', label: 'Triple' },
    { value: 'cuadruple', label: 'Cuadruple' },
    { value: 'quintuple', label: 'Quintuple' }
  ];

  const opcionesPiso = [
    { value: 'planta baja', label: 'Planta Baja' },
    { value: 'primer piso', label: 'Primer Piso' },
    { value: 'segundo piso', label: 'Segundo Piso' },
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.numero || !formData.tipo || !formData.piso) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    try {
      if (editandoId) {
        await habitacionesService.update(editandoId, formData);
        toast.success('Habitación actualizada exitosamente');
      } else {
        await habitacionesService.create(formData);
        toast.success('Habitación creada exitosamente');
      }
      
      setFormData({ numero: '', tipo: 'doble', piso: 'planta baja' });
      setEditandoId(null);
      setShowForm(false);
      loadHabitaciones();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editandoId ? 'Error al actualizar la habitación' : 'Error al crear la habitación');
    }
  };

  const handleVerHabitacion = (habitacion) => {
    const detalles = `
      Número: ${habitacion.numero}
      Tipo: ${habitacion.tipo_display || habitacion.tipo}
      Piso: ${habitacion.piso}
      ID: ${habitacion.id}
    `;
    
    alert(`Detalles de la Habitación:\n\n${detalles}`);
    console.log('Ver habitación:', habitacion);
  };

  const handleEditarHabitacion = (habitacion) => {
    setFormData({
      numero: habitacion.numero,
      tipo: habitacion.tipo,
      piso: habitacion.piso
    });
    setEditandoId(habitacion.id);
    setShowForm(true);
  };

  const handleEliminarHabitacion = async (habitacion) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la habitación ${habitacion.numero}?`)) {
      try {
        await habitacionesService.delete(habitacion.id);
        toast.success('Habitación eliminada exitosamente');
        loadHabitaciones();
      } catch (error) {
        console.error('Error al eliminar habitación:', error);
        toast.error('Error al eliminar la habitación');
      }
    }
  };

  const handleNuevaHabitacion = () => {
    setFormData({ numero: '', tipo: 'doble', piso: 'planta baja' });
    setEditandoId(null);
    setShowForm(true);
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditandoId(null);
    setFormData({ numero: '', tipo: 'doble', piso: 'planta baja' });
  };

  // Agrupar habitaciones por piso
  const habitacionesPorPiso = habitaciones.reduce((acc, habitacion) => {
    const piso = habitacion.piso || 'Sin piso';
    if (!acc[piso]) {
      acc[piso] = [];
    }
    acc[piso].push(habitacion);
    return acc;
  }, {});

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
        {/* Solo mostrar botón de nueva habitación para supervisores */}
        {user?.perfil?.rol === 'supervisor' && (
          <button 
            onClick={handleNuevaHabitacion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaPlus className="h-4 w-4" />
            <span>Nueva Habitación</span>
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editandoId ? 'Editar Habitación' : 'Nueva Habitación'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {opcionesTipo.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Piso <span className="text-red-500">*</span>
                </label>
                <select
                  name="piso"
                  value={formData.piso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {opcionesPiso.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelar}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {editandoId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de habitaciones organizadas por piso */}
      {Object.entries(habitacionesPorPiso).map(([piso, habitacionesPiso]) => (
        <div key={piso} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {piso.charAt(0).toUpperCase() + piso.slice(1)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitacionesPiso.map((habitacion) => (
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
                          {habitacion.tipo_display || habitacion.tipo}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleVerHabitacion(habitacion)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      {/* Solo mostrar botones de editar y eliminar para supervisores */}
                      {user?.perfil?.rol === 'supervisor' && (
                        <>
                          <button 
                            onClick={() => handleEditarHabitacion(habitacion)}
                            className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50"
                            title="Editar habitación"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEliminarHabitacion(habitacion)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Eliminar habitación"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {habitaciones.length === 0 && !showForm && (
        <div className="text-center py-12">
          <FaBed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay habitaciones</h3>
          <p className="text-gray-500">Crea la primera habitación para comenzar.</p>
        </div>
      )}
    </div>
  );
};

export default Habitaciones;
