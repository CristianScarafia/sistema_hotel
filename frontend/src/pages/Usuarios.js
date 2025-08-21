import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usuariosService } from '../services/api';
import { FaUser, FaUserPlus, FaEye, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    is_active: true,
    rol: 'conserge',
    turno: 'mañana'
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      console.log('Cargando usuarios...');
      const response = await usuariosService.getAll();
      console.log('Respuesta de la API:', response);
      console.log('Usuarios recibidos:', response.data);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      console.error('Detalles del error:', error.response);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
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
    
    // Validar campos obligatorios
    const camposObligatorios = ['username', 'email', 'first_name', 'last_name'];
    const camposVacios = camposObligatorios.filter(campo => !formData[campo]);
    
    if (camposVacios.length > 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validar contraseña para usuarios nuevos
    if (!editandoId && !formData.password) {
      toast.error('La contraseña es obligatoria para usuarios nuevos');
      return;
    }

    // Validar que las contraseñas coincidan si se proporcionan
    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const datosParaEnviar = { ...formData };
      
      // Si no se proporciona contraseña en edición, no enviarla
      if (editandoId && !formData.password) {
        delete datosParaEnviar.password;
        delete datosParaEnviar.confirm_password;
      }

      if (editandoId) {
        await usuariosService.update(editandoId, datosParaEnviar);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await usuariosService.create(datosParaEnviar);
        toast.success('Usuario creado exitosamente');
      }
      
      // Limpiar formulario y estado
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
        is_active: true,
        rol: 'conserge',
        turno: 'mañana'
      });
      setEditandoId(null);
      setShowForm(false);
      loadUsuarios();
    } catch (error) {
      console.error('Error al procesar usuario:', error);
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          // Manejar errores de validación de Django
          const errorMessages = [];
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else if (typeof messages === 'string') {
              errorMessages.push(messages);
            }
          });
          toast.error(errorMessages.join(', '));
        } else if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error('Error al procesar el usuario');
        }
      } else {
        toast.error('Error al procesar el usuario');
      }
    }
  };

  const handleNuevoUsuario = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
      is_active: true,
      rol: 'conserge',
      turno: 'mañana'
    });
    setEditandoId(null);
    setShowForm(true);
  };

  const handleEditarUsuario = (usuario) => {
    setFormData({
      username: usuario.username,
      email: usuario.email || '',
      first_name: usuario.first_name || '',
      last_name: usuario.last_name || '',
      password: '',
      confirm_password: '',
      is_active: usuario.is_active,
      rol: usuario.rol,
      turno: usuario.turno
    });
    setEditandoId(usuario.id);
    setShowForm(true);
  };

  const handleEliminarUsuario = async (usuario) => {
    if (window.confirm(`¿Está seguro de que desea eliminar al usuario "${usuario.username}"?`)) {
      try {
        await usuariosService.delete(usuario.id);
        toast.success('Usuario eliminado exitosamente');
        loadUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  const handleVerUsuario = (usuario) => {
    setUsuarioDetalle(usuario);
    setShowDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setShowDetalle(false);
    setUsuarioDetalle(null);
  };

  const handleCancelar = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
      is_active: true,
      rol: 'conserge',
      turno: 'mañana'
    });
    setEditandoId(null);
    setShowForm(false);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <button
          onClick={handleNuevoUsuario}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaUserPlus className="h-4 w-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editandoId ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario * <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email * <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre * <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido * <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {!editandoId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editandoId}
                  placeholder={editandoId ? "Dejar vacío para no cambiar" : ""}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña {!editandoId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editandoId}
                  placeholder={editandoId ? "Dejar vacío para no cambiar" : ""}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="conserge">Conserje</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno
                </label>
                <select
                  name="turno"
                  value={formData.turno}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Usuario activo
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelar}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <FaTimes className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <FaCheck className="h-4 w-4" />
                <span>{editandoId ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {usuario.first_name} {usuario.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {usuario.email || 'Sin email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.rol === 'supervisor' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.rol_display || usuario.rol || 'Conserje'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.turno === 'mañana' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : usuario.turno === 'tarde'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.turno_display || usuario.turno || 'Mañana'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerUsuario(usuario)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Ver detalles"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditarUsuario(usuario)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Editar usuario"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarUsuario(usuario)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar usuario"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <FaUser className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
                    <p className="text-gray-500">Comienza creando el primer usuario del sistema.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetalle && usuarioDetalle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Usuario</h3>
                <button
                  onClick={handleCerrarDetalle}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario:</label>
                  <p className="text-sm text-gray-900">{usuarioDetalle.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo:</label>
                  <p className="text-sm text-gray-900">
                    {usuarioDetalle.first_name} {usuarioDetalle.last_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email:</label>
                  <p className="text-sm text-gray-900">{usuarioDetalle.email || 'Sin email'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    usuarioDetalle.rol === 'supervisor' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {usuarioDetalle.rol_display || usuarioDetalle.rol || 'Conserje'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Turno:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    usuarioDetalle.turno === 'mañana' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : usuarioDetalle.turno === 'tarde'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {usuarioDetalle.turno_display || usuarioDetalle.turno || 'Mañana'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    usuarioDetalle.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {usuarioDetalle.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID:</label>
                  <p className="text-sm text-gray-900">{usuarioDetalle.id}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCerrarDetalle}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
