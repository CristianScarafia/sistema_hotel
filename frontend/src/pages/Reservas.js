import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reservasService, usuariosService, habitacionesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaEye, FaPrint } from 'react-icons/fa';
import { toTitleCase } from '../utils/hotelUtils';

const Reservas = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionesFiltradas, setHabitacionesFiltradas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // Para controlar si estamos editando
  const [formData, setFormData] = useState({
    encargado: '',
    nhabitacion: '',
    origen: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_ingreso: '',
    fecha_egreso: '',
    personas: 1,
    cantidad_habitaciones: 1,
    monto_total: '',
    senia: '',
    celiacos: false,
    observaciones: ''
  });

  
  useEffect(() => {
    loadReservas();
    loadHabitaciones();
    loadUsuarios();
  }, []);

  // Refrescar habitaciones filtradas cuando cambian fechas o personas
  useEffect(() => {
    const { fecha_ingreso, fecha_egreso, personas } = formData;
    if (fecha_ingreso && fecha_egreso && personas) {
      habitacionesService
        .getDisponibles({
          fecha_ingreso,
          fecha_egreso,
          personas,
        })
        .then((resp) => {
          const data = resp.data?.results || resp.data || [];
          setHabitacionesFiltradas(Array.isArray(data) ? data : []);
          // Si la habitación seleccionada ya no está, limpiarla
          if (
            formData.nhabitacion &&
            !data.some((h) => String(h.id) === String(formData.nhabitacion))
          ) {
            setFormData((prev) => ({ ...prev, nhabitacion: '' }));
          }
        })
        .catch(() => {
          setHabitacionesFiltradas([]);
        });
    } else {
      // Si no hay criterios suficientes, mostrar lista completa
      setHabitacionesFiltradas(habitaciones);
    }
  }, [formData, habitaciones]);

  // Importación movida a Configuración

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await reservasService.getAll();
      setReservas(response.data.results || response.data);
      setVisibleCount(20);
    } catch (error) {
      toast.error('Error al cargar las reservas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHabitaciones = async () => {
    try {
      const response = await habitacionesService.getAll();
      const data = response.data;
      
      // Verificar si la respuesta es un array o tiene la estructura esperada
      if (Array.isArray(data)) {
        setHabitaciones(data);
        setHabitacionesFiltradas(data);
      } else if (data.results && Array.isArray(data.results)) {
        setHabitaciones(data.results);
        setHabitacionesFiltradas(data.results);
      } else {
        // Si la estructura es inesperada, establecer array vacío
        console.warn('Estructura de respuesta inesperada para habitaciones:', data);
        setHabitaciones([]);
        setHabitacionesFiltradas([]);
      }
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      setHabitaciones([]);
      setHabitacionesFiltradas([]);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await usuariosService.getAll();
      const data = response.data;
      
      // Verificar si la respuesta es un array o tiene la estructura esperada
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else if (data.results && Array.isArray(data.results)) {
        setUsuarios(data.results);
      } else {
        // Si la estructura es inesperada, establecer array vacío
        console.warn('Estructura de respuesta inesperada para usuarios:', data);
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Si el error es 403 (Forbidden), mostrar mensaje específico
      if (error.response?.status === 403) {
        console.warn('No tienes permisos para ver usuarios. Solo los supervisores pueden acceder a esta información.');
      }
      setUsuarios([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén completos
    const camposObligatorios = [
      'encargado', 'nhabitacion', 'origen', 'nombre', 'apellido', 
      'telefono', 'fecha_ingreso', 'fecha_egreso', 'personas', 
      'cantidad_habitaciones', 'monto_total', 'senia'
    ];
    
    const camposVacios = camposObligatorios.filter(campo => !formData[campo]);
    
    if (camposVacios.length > 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      // Preparar los datos en el formato correcto para la API
      const datosParaEnviar = {
        ...formData,
        habitacion_id: formData.nhabitacion, // Cambiar nhabitacion por habitacion_id
        encargado: parseInt(formData.encargado), // Asegurar que sea un entero
        personas: parseInt(formData.personas),
        cantidad_habitaciones: parseInt(formData.cantidad_habitaciones),
        monto_total: parseFloat(formData.monto_total),
        senia: parseFloat(formData.senia),
        celiacos: Boolean(formData.celiacos)
      };

      // Eliminar el campo nhabitacion ya que usamos habitacion_id
      delete datosParaEnviar.nhabitacion;

      console.log('Datos a enviar:', datosParaEnviar); // Para debugging

      if (editandoId) {
        // Actualizar reserva existente
        await reservasService.update(editandoId, datosParaEnviar);
        toast.success('Reserva actualizada exitosamente');
      } else {
        // Crear nueva reserva
        // Asegurar que el CSRF del header coincide con la cookie
        try {
          const tokenFromCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
          if (tokenFromCookie) {
            // Import lazy to avoid circular
            const { setCsrfToken } = await import('../services/api');
            setCsrfToken(tokenFromCookie);
          }
        } catch {}
        const resp = await reservasService.create(datosParaEnviar);
        toast.success('Reserva creada exitosamente');
        try {
          const nuevaId = resp?.data?.id;
          if (nuevaId) {
            const voucherUrl = reservasService.getVoucherUrl(nuevaId);
            window.open(voucherUrl, '_blank', 'noopener');
          }
        } catch (e) {
          console.warn('No se pudo abrir el voucher automáticamente:', e);
        }
      }

      // Limpiar formulario y estado de edición
      setFormData({
        encargado: '',
        nhabitacion: '',
        origen: '',
        nombre: '',
        apellido: '',
        telefono: '',
        fecha_ingreso: '',
        fecha_egreso: '',
        personas: 1,
        cantidad_habitaciones: 1,
        monto_total: '',
        senia: '',
        celiacos: false,
        observaciones: ''
      });
      setEditandoId(null);
      loadReservas();
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        // Si la reserva se creó pero hay un error en la respuesta, mostrar mensaje de éxito
        if (error.response.status === 201 || error.response.status === 200) {
          toast.success(editandoId ? 'Reserva actualizada exitosamente' : 'Reserva creada exitosamente');
          setFormData({
            encargado: '',
            nhabitacion: '',
            origen: '',
            nombre: '',
            apellido: '',
            telefono: '',
            fecha_ingreso: '',
            fecha_egreso: '',
            personas: 1,
            cantidad_habitaciones: 1,
            monto_total: '',
            senia: '',
            celiacos: false,
            observaciones: ''
          });
          setEditandoId(null);
          loadReservas();
        } else {
          toast.error(`Error: ${error.response.data.error || error.response.data.detail || 'Error al procesar la reserva'}`);
        }
      } else {
        toast.error('Error al procesar la reserva');
      }
    }
  };

  // Funciones para los botones de acción
  const handleVerReserva = (reserva) => {
    const detalles = `
      Nombre: ${reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`}
      Teléfono: ${reserva.telefono}
      Habitación: ${reserva.habitacion_numero || reserva.habitacion?.numero}
      Fechas: ${new Date(reserva.fecha_ingreso).toLocaleDateString()} - ${new Date(reserva.fecha_egreso).toLocaleDateString()}
      Personas: ${reserva.personas}
      Monto Total: $${parseFloat(reserva.monto_total).toLocaleString()}
      Seña: $${parseFloat(reserva.senia).toLocaleString()}
      Origen: ${reserva.origen}
      Celiacos: ${reserva.celiacos ? 'Sí' : 'No'}
      Observaciones: ${reserva.observaciones || 'Ninguna'}
    `;
    
    alert(`Detalles de la Reserva:\n\n${detalles}`);
    console.log('Ver reserva:', reserva);
  };

  const handleEditarReserva = (reserva) => {
    toast.info(`Editando reserva de ${reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`}`);
    
    // Cargar los datos de la reserva en el formulario
    setFormData({
      encargado: reserva.encargado || '',
      nhabitacion: reserva.habitacion_id || reserva.habitacion?.id || '',
      origen: reserva.origen || '',
      nombre: reserva.nombre || '',
      apellido: reserva.apellido || '',
      telefono: reserva.telefono || '',
      fecha_ingreso: reserva.fecha_ingreso || '',
      fecha_egreso: reserva.fecha_egreso || '',
      personas: reserva.personas || 1,
      cantidad_habitaciones: reserva.cantidad_habitaciones || 1,
      monto_total: reserva.monto_total || '',
      senia: reserva.senia || '',
      celiacos: reserva.celiacos || false,
      observaciones: reserva.observaciones || ''
    });
    setEditandoId(reserva.id); // Establecer el ID de la reserva a editar
    
    console.log('Editar reserva:', reserva);
  };

  const handleEliminarReserva = async (reserva) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la reserva de ${reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`}?`)) {
      try {
        await reservasService.delete(reserva.id);
        toast.success('Reserva eliminada exitosamente');
        loadReservas();
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
        toast.error('Error al eliminar la reserva');
      }
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
      <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Nueva Reserva (columna izquierda) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editandoId ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grupo 1: Encargado + Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encargado <span className="text-red-500">*</span>
                </label>
                <select
                  name="encargado"
                  value={formData.encargado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar encargado</option>
                  {Array.isArray(usuarios) && usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Egreso <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_egreso"
                  value={formData.fecha_egreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Grupo 2: Datos del huésped */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Grupo 3: Personas + Cantidad de Habitaciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Personas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="personas"
                  value={formData.personas}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Habitaciones <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad_habitaciones"
                  value={formData.cantidad_habitaciones}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habitación <span className="text-red-500">*</span>
                </label>
                <select
                  name="nhabitacion"
                  value={formData.nhabitacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.fecha_ingreso || !formData.fecha_egreso || !formData.personas}
                >
                  <option value="">{!formData.fecha_ingreso || !formData.fecha_egreso || !formData.personas ? 'Seleccione encargado, fechas y personas' : 'Seleccionar habitación'}</option>
                  {Array.isArray(habitacionesFiltradas) && habitacionesFiltradas.map(habitacion => (
                    <option key={habitacion.id} value={habitacion.id}>
                      {habitacion.numero} - {habitacion.tipo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grupo 4: Capacidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Personas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="personas"
                  value={formData.personas}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Habitaciones <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad_habitaciones"
                  value={formData.cantidad_habitaciones}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Grupo 5: Montos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Total <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monto_total"
                  value={formData.monto_total}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seña <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="senia"
                  value={formData.senia}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Grupo 6: Observaciones y celiacos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="celiacos"
                    checked={formData.celiacos}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Celiacos</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end pt-4 gap-2">
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setFormData({
                      encargado: '',
                      nhabitacion: '',
                      origen: '',
                      nombre: '',
                      apellido: '',
                      telefono: '',
                      fecha_ingreso: '',
                      fecha_egreso: '',
                      personas: 1,
                      cantidad_habitaciones: 1,
                      monto_total: '',
                      senia: '',
                      celiacos: false,
                      observaciones: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >Cancelar</button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {editandoId ? 'Actualizar Reserva' : 'Guardar Reserva'}
              </button>
              {/* Importar reservado para Configuración */}
            </div>
          </form>
        </div>

        {/* Lista de Reservas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Reservas</h2>
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, nombre, apellido o habitación..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de reserva</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Habitación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(reservas) && reservas
                  .filter((r) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.trim().toLowerCase();
                    const idMatch = String(r.id || '').includes(q);
                    const nombre = (r.nombre || '').toLowerCase();
                    const apellido = (r.apellido || '').toLowerCase();
                    const nombreCompleto = (r.nombre_completo || `${r.nombre || ''} ${r.apellido || ''}`).toLowerCase();
                    const habNum = String(r.habitacion_numero || r.habitacion?.numero || '').toLowerCase();
                    return (
                      idMatch ||
                      nombre.includes(q) ||
                      apellido.includes(q) ||
                      nombreCompleto.includes(q) ||
                      habNum.includes(q)
                    );
                  })
                  .slice(0, visibleCount)
                  .map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reserva.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {toTitleCase(reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reserva.habitacion_numero || reserva.habitacion?.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reserva.fecha_ingreso).toLocaleDateString()} - {new Date(reserva.fecha_egreso).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${parseFloat(reserva.monto_total).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="ml-4 flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              try {
                                const url = reservasService.getVoucherUrl(reserva.id);
                                window.open(url, '_blank', 'noopener');
                              } catch (e) {
                                console.warn('No se pudo abrir el voucher:', e);
                              }
                            }}
                            className="text-gray-700 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                            title="Imprimir voucher"
                          >
                            <FaPrint className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleVerReserva(reserva)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          {user?.perfil?.rol === 'supervisor' && (
                            <>
                              <button 
                                onClick={() => handleEditarReserva(reserva)}
                                className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50"
                                title="Editar reserva"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEliminarReserva(reserva)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Eliminar reserva"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* Cargar más */}
          {Array.isArray(reservas) && (
            (() => {
              const filteredCount = reservas.filter((r) => {
                if (!searchQuery) return true;
                const q = searchQuery.trim().toLowerCase();
                const idMatch = String(r.id || '').includes(q);
                const nombre = (r.nombre || '').toLowerCase();
                const apellido = (r.apellido || '').toLowerCase();
                const nombreCompleto = (r.nombre_completo || `${r.nombre || ''} ${r.apellido || ''}`).toLowerCase();
                const habNum = String(r.habitacion_numero || r.habitacion?.numero || '').toLowerCase();
                return (
                  idMatch || nombre.includes(q) || apellido.includes(q) || nombreCompleto.includes(q) || habNum.includes(q)
                );
              }).length;
              return visibleCount < filteredCount ? (
                <div className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 20)}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                  >
                    Cargar más
                  </button>
                </div>
              ) : null;
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservas;
