import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { reservasService, usuariosService, habitacionesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaEye, FaPrint } from 'react-icons/fa';
import { toTitleCase } from '../utils/hotelUtils';

const Reservas = () => {
  const { user } = useAuth();
  const formContainerRef = useRef(null);
  const [reservas, setReservas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [habitaciones, setHabitaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // Para controlar si estamos editando
  const [habitacionesDisponiblesRango, setHabitacionesDisponiblesRango] = useState([]);
  const [multiPersonas, setMultiPersonas] = useState([1]);
  const [multiHabitacionIds, setMultiHabitacionIds] = useState(['']);
  const [formData, setFormData] = useState({
    encargado: '',
    origen: '',
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_ingreso: '',
    fecha_egreso: '',
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

  // Refrescar habitaciones disponibles por rango cuando cambian fechas
  useEffect(() => {
    const { fecha_ingreso, fecha_egreso } = formData;
    if (fecha_ingreso && fecha_egreso) {
      habitacionesService
        .getDisponibles({
          fecha_ingreso,
          fecha_egreso,
        })
        .then((resp) => {
          const data = resp.data?.results || resp.data || [];
          let lista = Array.isArray(data) ? data : [];
          setHabitacionesDisponiblesRango(lista);
        })
        .catch(() => {
          setHabitacionesDisponiblesRango([]);
        });
    } else {
      setHabitacionesDisponiblesRango(habitaciones);
    }
  }, [formData, habitaciones, editandoId]);

  // Mantener arrays dinámicos en sync con cantidad_habitaciones
  useEffect(() => {
    const n = parseInt(formData.cantidad_habitaciones || 1);
    setMultiPersonas((prev) => {
      const arr = prev.slice(0, n);
      while (arr.length < n) arr.push(1);
      return arr;
    });
    setMultiHabitacionIds((prev) => {
      const arr = prev.slice(0, n);
      while (arr.length < n) arr.push('');
      return arr;
    });
  }, [formData.cantidad_habitaciones]);

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
      } else if (data.results && Array.isArray(data.results)) {
        setHabitaciones(data.results);
      } else {
        // Si la estructura es inesperada, establecer array vacío
        console.warn('Estructura de respuesta inesperada para habitaciones:', data);
        setHabitaciones([]);
      }
    } catch (error) {
      console.error('Error al cargar habitaciones:', error);
      setHabitaciones([]);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await usuariosService.getAll();
      const data = response.data;
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else if (data.results && Array.isArray(data.results)) {
        setUsuarios(data.results);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
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
    
    // Validaciones base
    const camposObligatoriosBase = [
      'encargado', 'origen', 'nombre', 'apellido',
      'telefono', 'fecha_ingreso', 'fecha_egreso',
      'monto_total', 'senia'
    ];
    const n = parseInt(formData.cantidad_habitaciones || 1);
    const camposObligatorios = [...camposObligatoriosBase, 'cantidad_habitaciones'];
    
    const isEmptyValue = (val) => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'string') return val.trim() === '';
      return false; // permitir 0 en números
    };
    const camposVacios = camposObligatorios.filter(campo => isEmptyValue(formData[campo]));
    // Validación extra: origen por select debe ser una de las opciones válidas
    const origenValido = ['Celular', 'Booking', 'Sindicato', 'Agencia', 'Calle'];
    if (!origenValido.includes(formData.origen)) camposVacios.push('origen');
    
    if (camposVacios.length > 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validar cada grupo (incluye 1 habitación)
    for (let i = 0; i < n; i++) {
      const p = parseInt(multiPersonas[i] || 0);
      const hid = multiHabitacionIds[i];
      if (!p || p <= 0) {
        toast.error(`Ingrese personas para la habitación #${i + 1}`);
        return;
      }
      if (!hid) {
        toast.error(`Seleccione la habitación #${i + 1}`);
        return;
      }
    }

    try {
      // Preparar los datos en el formato correcto para la API
      const datosParaEnviar = {
        ...formData,
        encargado: parseInt(formData.encargado),
        cantidad_habitaciones: n,
        monto_total: parseFloat(formData.monto_total),
        senia: parseFloat(formData.senia),
        celiacos: Boolean(formData.celiacos)
      };

      // Construir arreglo de habitaciones siempre (incluye caso 1)
      datosParaEnviar.habitaciones = multiHabitacionIds.map((id, idx) => ({
        habitacion_id: parseInt(id),
        personas: parseInt(multiPersonas[idx] || 1),
      }));

      console.log('Datos a enviar:', datosParaEnviar); // Para debugging

      if (editandoId) {
        // Actualizar reserva existente
        // Para edición de una reserva individual, tomamos el primer item
        const simple = {
          ...datosParaEnviar,
          habitacion_id: datosParaEnviar.habitaciones?.[0]?.habitacion_id,
          personas: datosParaEnviar.habitaciones?.[0]?.personas,
        };
        delete simple.habitaciones;
        await reservasService.update(editandoId, simple);
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
        const data = resp?.data;
        if (Array.isArray(data)) {
          toast.success(`Se crearon ${data.length} reservas exitosamente`);
          try {
            const ids = data.map((r) => r.id).filter(Boolean);
            if (ids.length) {
              const url = reservasService.getVoucherMultiUrl(ids);
              window.open(url, '_blank', 'noopener');
            }
          } catch (e) {
            console.warn('No se pudo abrir el voucher automáticamente:', e);
          }
        } else {
          toast.success('Reserva creada exitosamente');
          try {
            const nuevaId = data?.id;
            if (nuevaId) {
              const voucherUrl = reservasService.getVoucherUrl(nuevaId);
              window.open(voucherUrl, '_blank', 'noopener');
            }
          } catch (e) {
            console.warn('No se pudo abrir el voucher automáticamente:', e);
          }
        }
      }

      // Limpiar formulario y estado de edición
      setFormData({
        encargado: '',
        origen: '',
        nombre: '',
        apellido: '',
        telefono: '',
        fecha_ingreso: '',
        fecha_egreso: '',
        cantidad_habitaciones: 1,
        monto_total: '',
        senia: '',
        celiacos: false,
        observaciones: ''
      });
      setMultiPersonas([1]);
      setMultiHabitacionIds(['']);
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

  const formatDateForInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      if (value.includes('T')) return value.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      // Soporte para dd/mm/yyyy (posible en producción)
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [dd, mm, yyyy] = value.split('/');
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    try {
      const d = new Date(value);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const splitNombreApellido = (nombreCompleto) => {
    if (!nombreCompleto || typeof nombreCompleto !== 'string') {
      return { nombre: '', apellido: '' };
    }
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 1) {
      return { nombre: partes[0], apellido: '' };
    }
    const apellido = partes.pop();
    const nombre = partes.join(' ');
    return { nombre, apellido };
  };

  const handleEditarReserva = (reserva) => {
    toast.info(`Editando reserva de ${reserva.nombre_completo || `${reserva.nombre} ${reserva.apellido}`}`);
    
    // Derivar datos que pueden venir en diferentes formas desde el backend
    const { nombre: nombreDerivado, apellido: apellidoDerivado } =
      splitNombreApellido(reserva.nombre_completo);

    const encargadoId =
      (reserva.encargado && reserva.encargado.id) ||
      reserva.encargado_id ||
      (() => {
        const username = reserva.encargado?.username || reserva.encargado_username || reserva.encargado;
        const match = Array.isArray(usuarios) ? usuarios.find((u) => u.username === username) : undefined;
        return match?.id || '';
      })();

    const habitacionId =
      reserva.habitacion_id ??
      reserva.habitacion?.id ??
      (() => {
        const numero = reserva.habitacion_numero ?? reserva.habitacion?.numero;
        const match = Array.isArray(habitaciones)
          ? habitaciones.find((h) => String(h.numero) === String(numero))
          : undefined;
        return match?.id ?? '';
      })();

    // Cargar los datos de la reserva en el formulario
    setFormData({
      encargado: encargadoId ?? '',
      origen: reserva.origen ?? '',
      nombre: (reserva.nombre ?? nombreDerivado) ?? '',
      apellido: (reserva.apellido ?? apellidoDerivado) ?? '',
      telefono: reserva.telefono ?? '',
      fecha_ingreso: (formatDateForInput(reserva.fecha_ingreso) ?? ''),
      fecha_egreso: (formatDateForInput(reserva.fecha_egreso) ?? ''),
      cantidad_habitaciones: 1,
      monto_total: reserva.monto_total ?? '',
      senia: reserva.senia ?? '',
      celiacos: reserva.celiacos ?? false,
      observaciones: reserva.observaciones ?? ''
    });
    setMultiPersonas([reserva.personas ?? 1]);
    setMultiHabitacionIds([habitacionId ?? '']);
    setEditandoId(reserva.id); // Establecer el ID de la reserva a editar
    
    console.log('Editar reserva:', reserva);
    try {
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
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

      <div className="space-y-6">
        {/* Formulario de Nueva Reserva (arriba, ancho completo) */}
        <div ref={formContainerRef} className={`rounded-lg shadow p-6 ${editandoId ? 'bg-blue-50' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">
            {editandoId ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grupo 1: Encargado + Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2 lg:col-span-2">
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
                  <option value="" disabled>Seleccionar encargado</option>
                  {Array.isArray(usuarios) && usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Egreso <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_egreso"
                  value={formData.fecha_egreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Grupo 2: Datos del huésped */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen <span className="text-red-500">*</span>
                </label>
                <select
                  name="origen"
                  value={formData.origen}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>Seleccionar origen</option>
                  <option value="Celular">Celular</option>
                  <option value="Booking">Booking</option>
                  <option value="Sindicato">Sindicato</option>
                  <option value="Agencia">Agencia</option>
                  <option value="Calle">Calle</option>
                </select>
              </div>
            </div>

            {/* Grupo 3: Cantidad de Habitaciones + Detalle por habitación (tamaño constante) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Habitaciones <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad_habitaciones"
                  value={formData.cantidad_habitaciones}
                  onChange={(e) => {
                    const maxHab = Math.max(1, parseInt(habitaciones?.length || 1));
                    const val = Math.min(Math.max(1, parseInt(e.target.value || 1)), maxHab);
                    setFormData((prev) => ({ ...prev, cantidad_habitaciones: val }));
                  }}
                  min="1"
                  max={habitaciones?.length || 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalle de Habitaciones y Personas <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {Array.from({ length: parseInt(formData.cantidad_habitaciones || 1) }).map((_, idx) => {
                    const p = parseInt(multiPersonas[idx] || 1);
                    const selectedOthers = multiHabitacionIds.filter((val, j) => j !== idx);
                    // Sugerir iguales o más grandes (nunca más chicas)
                    const opciones = (habitacionesDisponiblesRango || []).filter((h) => {
                      if (selectedOthers.includes(String(h.id))) return false;
                      if (p <= 2) return ['doble', 'triple', 'cuadruple', 'quintuple'].includes(h.tipo);
                      if (p === 3) return ['triple', 'cuadruple', 'quintuple'].includes(h.tipo);
                      if (p === 4) return ['cuadruple', 'quintuple'].includes(h.tipo);
                      return ['quintuple'].includes(h.tipo);
                    });
                    return (
                      <div key={idx} className="grid grid-cols-5 gap-2">
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            value={multiPersonas[idx]}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value || 1));
                              setMultiPersonas((prev) => {
                                const arr = [...prev];
                                arr[idx] = val;
                                return arr;
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Personas #${idx + 1}`}
                          />
                        </div>
                        <div className="col-span-3">
                          <select
                            value={multiHabitacionIds[idx]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMultiHabitacionIds((prev) => {
                                const arr = [...prev];
                                arr[idx] = val;
                                return arr;
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!formData.fecha_ingreso || !formData.fecha_egreso}
                          >
                            <option value="" disabled>{!formData.fecha_ingreso || !formData.fecha_egreso ? 'Seleccione fechas' : 'Seleccionar habitación'}</option>
                            {opciones.map((habitacion) => (
                              <option key={habitacion.id} value={habitacion.id}>
                                {habitacion.numero} - {habitacion.tipo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grupo 4 eliminado: duplicado de capacidad */}

            {/* Grupo 5: Montos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      origen: '',
                      nombre: '',
                      apellido: '',
                      telefono: '',
                      fecha_ingreso: '',
                      fecha_egreso: '',
                      cantidad_habitaciones: 1,
                      monto_total: '',
                      senia: '',
                      celiacos: false,
                      observaciones: ''
                    });
                    setMultiPersonas([1]);
                    setMultiHabitacionIds(['']);
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

        {/* Lista de Reservas (debajo, ancho completo) */}
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
