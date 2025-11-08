import { useState, useEffect } from 'react';
import './Productos.css';
import { productosAPI, recetasAPI } from '../services/api';
import Modal from './Modal';

function Productos({ stockItems, setStockItems, reloadStock }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoProducto, setNuevoProducto] = useState({ 
    nombre: '', 
    precio_unidad: '', 
    precio_kg: '',
    unidades: '0', 
    peso_kg: '0',
    unidades_por_receta: '',
    peso_por_receta: ''
  });
  const [precioEditMode, setPrecioEditMode] = useState('unidad'); // 'unidad' o 'kg'
  const [mostrarStockInicial, setMostrarStockInicial] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarReceta, setMostrarReceta] = useState(null);
  const [ingredienteReceta, setIngredienteReceta] = useState({ ingrediente: '', cantidad: '', unidad: 'kg' });
  const [modal, setModal] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });

  // Cargar productos desde la API al montar
  useEffect(() => {
    loadProductos();
  }, []);

  const mostrarModal = (titulo, mensaje, tipo = 'info') => {
    setModal({ isOpen: true, titulo, mensaje, tipo });
  };

  const cerrarModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await productosAPI.getAll();
      setProductos(data);
    } catch (error) {
      mostrarModal('Error', `Error al cargar productos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    
    // Validar que estén todos los campos requeridos
    if (!nuevoProducto.nombre || !nuevoProducto.nombre.trim()) {
      mostrarModal('Campo requerido', 'El nombre del producto es obligatorio', 'warning');
      return;
    }
    
    if (!nuevoProducto.unidades_por_receta || !nuevoProducto.peso_por_receta) {
      mostrarModal('Receta incompleta', 'Debes definir la relación unidades/kg de la receta', 'warning');
      return;
    }
    
    const precioFinal = precioEditMode === 'unidad' ? parseFloat(nuevoProducto.precio_unidad) : parseFloat(nuevoProducto.precio_kg);
    if (!precioFinal || precioFinal <= 0) {
      mostrarModal('Precio requerido', 'Debes ingresar un precio válido', 'warning');
      return;
    }
    
    try {
      const producto = await productosAPI.create({
        nombre: nuevoProducto.nombre,
        precio: precioFinal,
        unidades: parseFloat(nuevoProducto.unidades || 0),
        peso_kg: parseFloat(nuevoProducto.peso_kg || 0),
        unidades_por_receta: parseFloat(nuevoProducto.unidades_por_receta),
        peso_por_receta: parseFloat(nuevoProducto.peso_por_receta)
      });
      setProductos([...productos, producto]);
      setNuevoProducto({ 
        nombre: '', 
        precio_unidad: '', 
        precio_kg: '',
        unidades: '0', 
        peso_kg: '0',
        unidades_por_receta: '',
        peso_por_receta: ''
      });
      setPrecioEditMode('unidad');
      setMostrarStockInicial(false);
      mostrarModal('¡Éxito!', 'Producto agregado correctamente', 'success');
    } catch (error) {
      mostrarModal('Error', `Error al agregar producto: ${error.message}`, 'error');
    }
  };

  const prepararReceta = async (productoId, cantidad) => {
    try {
      const productoActualizado = await recetasAPI.preparar(productoId, cantidad);
      
      // Actualizar el producto en el estado
      setProductos(productos.map(p => 
        p.id === productoId ? productoActualizado : p
      ));
      
      // Recargar el stock para reflejar los cambios
      await reloadStock();
      
      const unidadesProducidas = productoActualizado.unidades_por_receta * cantidad;
      const pesoProducido = productoActualizado.peso_por_receta * cantidad;
      mostrarModal('¡Éxito!', `Se prepararon ${cantidad} receta(s) de ${productoActualizado.nombre}. Producido: ${unidadesProducidas} unidades (${pesoProducido} kg)`, 'success');
    } catch (error) {
      mostrarModal('Error', `Error al preparar receta: ${error.message}`, 'error');
    }
  };

  const agregarIngredienteReceta = async (productoId) => {
    if (!ingredienteReceta.ingrediente || !ingredienteReceta.cantidad) {
      mostrarModal('Campos incompletos', 'Completa todos los campos del ingrediente', 'warning');
      return;
    }

    const stockItem = stockItems.find(s => s.nombre === ingredienteReceta.ingrediente);
    if (!stockItem) {
      mostrarModal('Error', `El ingrediente "${ingredienteReceta.ingrediente}" no existe en el stock`, 'error');
      return;
    }

    try {
      const nuevoIngrediente = await recetasAPI.addIngrediente(productoId, {
        ingrediente: ingredienteReceta.ingrediente,
        cantidad: parseFloat(ingredienteReceta.cantidad),
        unidad: ingredienteReceta.unidad
      });

      // Actualizar el producto en el estado local
      setProductos(productos.map(p => {
        if (p.id === productoId) {
          const recetaActual = p.receta || [];
          return {
            ...p,
            receta: [...recetaActual, nuevoIngrediente]
          };
        }
        return p;
      }));

      setIngredienteReceta({ ingrediente: '', cantidad: '', unidad: 'kg' });
      mostrarModal('¡Éxito!', 'Ingrediente agregado correctamente', 'success');
    } catch (error) {
      mostrarModal('Error', `Error al agregar ingrediente: ${error.message}`, 'error');
    }
  };

  const eliminarIngredienteReceta = async (productoId, ingredienteId) => {
    if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return;

    try {
      await recetasAPI.deleteIngrediente(productoId, ingredienteId);
      
      // Actualizar el producto en el estado local
      setProductos(productos.map(p => {
        if (p.id === productoId) {
          return {
            ...p,
            receta: p.receta.filter(ing => ing.id !== ingredienteId)
          };
        }
        return p;
      }));

      mostrarModal('¡Éxito!', 'Ingrediente eliminado correctamente', 'success');
    } catch (error) {
      mostrarModal('Error', `Error al eliminar ingrediente: ${error.message}`, 'error');
    }
  };

  const iniciarEdicion = (producto) => {
    setEditando({
      ...producto,
      editando_campo: null // 'unidades' o 'peso'
    });
  };

  const handleCantidadChange = (field, value) => {
    if (!editando) return;
    
    const newValue = parseFloat(value) || 0;
    const ratio = editando.peso_por_receta / editando.unidades_por_receta;
    
    if (field === 'unidades') {
      setEditando({
        ...editando,
        unidades: newValue,
        peso_kg: newValue * ratio,
        editando_campo: 'unidades'
      });
    } else if (field === 'peso') {
      setEditando({
        ...editando,
        peso_kg: newValue,
        unidades: newValue / ratio,
        editando_campo: 'peso'
      });
    }
  };

  const handlePrecioChange = (tipo, value) => {
    const precio = parseFloat(value) || 0;
    const precioUnitario = editando.precio / editando.unidades_por_receta; // precio por unidad
    const precioPorKg = editando.precio / editando.peso_por_receta; // precio por kg
    
    if (tipo === 'unidad') {
      // Si edita precio por unidad, calcular nuevo precio base
      const nuevoPrecio = precio * editando.unidades_por_receta;
      setEditando({
        ...editando,
        precio: nuevoPrecio,
        editando_precio: 'unidad'
      });
    } else if (tipo === 'kg') {
      // Si edita precio por kg, calcular nuevo precio base
      const nuevoPrecio = precio * editando.peso_por_receta;
      setEditando({
        ...editando,
        precio: nuevoPrecio,
        editando_precio: 'kg'
      });
    }
  };

  const handlePrecioNuevoChange = (tipo, value) => {
    const precio = parseFloat(value) || 0;
    const unidadesPorReceta = parseFloat(nuevoProducto.unidades_por_receta) || 1;
    const pesoPorReceta = parseFloat(nuevoProducto.peso_por_receta) || 1;
    
    if (tipo === 'unidad') {
      const precioTotal = precio * unidadesPorReceta;
      const precioKg = precioTotal / pesoPorReceta;
      setNuevoProducto({
        ...nuevoProducto,
        precio_unidad: value,
        precio_kg: precioKg.toFixed(2)
      });
      setPrecioEditMode('unidad');
    } else if (tipo === 'kg') {
      const precioTotal = precio * pesoPorReceta;
      const precioUnidad = precioTotal / unidadesPorReceta;
      setNuevoProducto({
        ...nuevoProducto,
        precio_kg: value,
        precio_unidad: precioUnidad.toFixed(2)
      });
      setPrecioEditMode('kg');
    }
  };

  const handleRecetaChange = (field, value) => {
    const newReceta = {
      ...nuevoProducto,
      [field]: value
    };
    
    setNuevoProducto(newReceta);
    
    // Si ambos campos de receta están llenos y hay precio, recalcular el precio opuesto
    if (newReceta.unidades_por_receta && newReceta.peso_por_receta) {
      const unidadesPorReceta = parseFloat(newReceta.unidades_por_receta);
      const pesoPorReceta = parseFloat(newReceta.peso_por_receta);
      
      if (precioEditMode === 'unidad' && newReceta.precio_unidad) {
        const precio = parseFloat(newReceta.precio_unidad);
        const precioTotal = precio * unidadesPorReceta;
        const precioKg = precioTotal / pesoPorReceta;
        setNuevoProducto({
          ...newReceta,
          precio_kg: precioKg.toFixed(2)
        });
      } else if (precioEditMode === 'kg' && newReceta.precio_kg) {
        const precio = parseFloat(newReceta.precio_kg);
        const precioTotal = precio * pesoPorReceta;
        const precioUnidad = precioTotal / unidadesPorReceta;
        setNuevoProducto({
          ...newReceta,
          precio_unidad: precioUnidad.toFixed(2)
        });
      }
    }
  };

  // Validar si los campos están habilitados
  const recetaCompleta = nuevoProducto.unidades_por_receta && nuevoProducto.peso_por_receta;
  const precioCompleto = (nuevoProducto.precio_unidad && parseFloat(nuevoProducto.precio_unidad) > 0) || 
                         (nuevoProducto.precio_kg && parseFloat(nuevoProducto.precio_kg) > 0);

  const guardarEdicion = async () => {
    if (!editando.nombre || !editando.nombre.trim()) {
      mostrarModal('Campo requerido', 'El nombre no puede estar vacío', 'warning');
      return;
    }

    try {
      await productosAPI.update(editando.id, {
        nombre: editando.nombre,
        precio: parseFloat(editando.precio),
        unidades: parseFloat(editando.unidades),
        peso_kg: parseFloat(editando.peso_kg),
        unidades_por_receta: parseFloat(editando.unidades_por_receta),
        peso_por_receta: parseFloat(editando.peso_por_receta)
      });

      await loadProductos();
      setEditando(null);
      mostrarModal('¡Éxito!', 'Producto actualizado correctamente', 'success');
    } catch (error) {
      mostrarModal('Error', `Error al actualizar producto: ${error.message}`, 'error');
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await productosAPI.delete(id);
      await loadProductos();
      mostrarModal('¡Éxito!', 'Producto eliminado correctamente', 'success');
    } catch (error) {
      mostrarModal('Error', `Error al eliminar producto: ${error.message}`, 'error');
    }
  };

  return (
    <div className="productos-container">
      <Modal 
        isOpen={modal.isOpen}
        onClose={cerrarModal}
        titulo={modal.titulo}
        mensaje={modal.mensaje}
        tipo={modal.tipo}
      />
      
      <h2>Gestión de Productos</h2>
      
      <form className="productos-form" onSubmit={agregarProducto}>
        <h3>Agregar nuevo producto:</h3>
        
        <div className="form-row">
          <div className="form-field">
            <label>Nombre del producto *</label>
            <input
              type="text"
              placeholder="Ej: Pan Francés, Torta de Chocolate..."
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h4>� 1. Configuración de Receta *</h4>
          <p className="form-help">
            Primero define cuántas unidades y cuánto peso produce una preparación de la receta.
            Ejemplo: 1 receta de pan produce 8 rodajas que pesan 1 kg en total.
          </p>
          <div className="form-row">
            <div className="form-field">
              <label>Unidades por receta *</label>
              <input
                type="number"
                placeholder="Ej: 8"
                step="0.01"
                min="0.01"
                value={nuevoProducto.unidades_por_receta}
                onChange={(e) => handleRecetaChange('unidades_por_receta', e.target.value)}
                required
              />
              <small>¿Cuántas unidades produce?</small>
            </div>
            <div className="form-field">
              <label>Peso por receta (kg) *</label>
              <input
                type="number"
                placeholder="Ej: 1"
                step="0.01"
                min="0.01"
                value={nuevoProducto.peso_por_receta}
                onChange={(e) => handleRecetaChange('peso_por_receta', e.target.value)}
                required
              />
              <small>¿Cuántos kg produce en total?</small>
            </div>
          </div>
          {recetaCompleta && (
            <div className="receta-info-resumen">
              ✓ Cada unidad pesa aproximadamente {(parseFloat(nuevoProducto.peso_por_receta) / parseFloat(nuevoProducto.unidades_por_receta) * 1000).toFixed(0)}g
            </div>
          )}
        </div>

        <div className={`form-section ${!recetaCompleta ? 'form-section-disabled' : ''}`}>
          <h4>� 2. Precio * {!recetaCompleta && '(Completa la receta primero)'}</h4>
          <p className="form-help">
            Ingresa el precio por unidad o por kilogramo. El otro valor se calculará automáticamente según la receta.
          </p>
          <div className="form-row">
            <div className="form-field">
              <label>Precio por unidad ($)</label>
              <input
                type="number"
                placeholder="Ej: 200"
                step="0.01"
                min="0"
                value={nuevoProducto.precio_unidad}
                onChange={(e) => handlePrecioNuevoChange('unidad', e.target.value)}
                readOnly={precioEditMode === 'kg'}
                disabled={!recetaCompleta}
                style={{ 
                  backgroundColor: precioEditMode === 'kg' ? '#f0f0f0' : 'white',
                  cursor: !recetaCompleta ? 'not-allowed' : 'text'
                }}
              />
              <small>{precioEditMode === 'kg' ? '(Calculado automáticamente)' : recetaCompleta ? 'Ingresa aquí el precio' : 'Completa la receta primero'}</small>
            </div>
            <div className="form-field">
              <label>Precio por kg ($)</label>
              <input
                type="number"
                placeholder="Ej: 1600"
                step="0.01"
                min="0"
                value={nuevoProducto.precio_kg}
                onChange={(e) => handlePrecioNuevoChange('kg', e.target.value)}
                readOnly={precioEditMode === 'unidad'}
                disabled={!recetaCompleta}
                style={{ 
                  backgroundColor: precioEditMode === 'unidad' ? '#f0f0f0' : 'white',
                  cursor: !recetaCompleta ? 'not-allowed' : 'text'
                }}
              />
              <small>{precioEditMode === 'unidad' ? '(Calculado automáticamente)' : recetaCompleta ? 'Ingresa aquí el precio' : 'Completa la receta primero'}</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4 style={{cursor: 'pointer', userSelect: 'none'}} onClick={() => setMostrarStockInicial(!mostrarStockInicial)}>
            📦 3. Stock Inicial (opcional) {mostrarStockInicial ? '▼' : '▶'}
          </h4>
          {mostrarStockInicial && (
            <>
              <p className="form-help">
                Normalmente el stock inicial es 0, ya que se produce mediante recetas. Solo completa esto si ya tienes stock existente.
              </p>
              <div className="form-row">
                <div className="form-field">
                  <label>Unidades en stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    value={nuevoProducto.unidades}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, unidades: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Peso en stock (kg)</label>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    value={nuevoProducto.peso_kg}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, peso_kg: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <button 
          type="submit" 
          className="btn-agregar-producto"
          disabled={!recetaCompleta || !precioCompleto}
          style={{
            opacity: (!recetaCompleta || !precioCompleto) ? 0.5 : 1,
            cursor: (!recetaCompleta || !precioCompleto) ? 'not-allowed' : 'pointer'
          }}
        >
          Agregar Producto
        </button>
        {(!recetaCompleta || !precioCompleto) && (
          <p style={{textAlign: 'center', color: '#666', fontSize: '0.9em', marginTop: '10px'}}>
            Completa la configuración de receta y el precio para poder agregar el producto
          </p>
        )}
      </form>

      <div className="productos-list">
        <h3>Lista de productos:</h3>
        {loading ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos disponibles. Agrega uno nuevo.</p>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock (unidades)</th>
              <th>Stock (kg)</th>
              <th>Receta (u/kg)</th>
              <th>Receta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id}>
                {editando && editando.id === producto.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editando.nombre}
                        onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                      />
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <input
                          type="number"
                          step="0.01"
                          value={(editando.precio / editando.unidades_por_receta).toFixed(2)}
                          onChange={(e) => handlePrecioChange('unidad', e.target.value)}
                          readOnly={editando.editando_precio === 'kg'}
                          style={{ 
                            backgroundColor: editando.editando_precio === 'kg' ? '#f0f0f0' : 'white',
                            fontSize: '0.9em'
                          }}
                          title="Precio por unidad"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={(editando.precio / editando.peso_por_receta).toFixed(2)}
                          onChange={(e) => handlePrecioChange('kg', e.target.value)}
                          readOnly={editando.editando_precio === 'unidad'}
                          style={{ 
                            backgroundColor: editando.editando_precio === 'unidad' ? '#f0f0f0' : 'white',
                            fontSize: '0.9em'
                          }}
                          title="Precio por kg"
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editando.unidades.toFixed(2)}
                        onChange={(e) => handleCantidadChange('unidades', e.target.value)}
                        readOnly={editando.editando_campo === 'peso'}
                        style={{ backgroundColor: editando.editando_campo === 'peso' ? '#f0f0f0' : 'white' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editando.peso_kg.toFixed(2)}
                        onChange={(e) => handleCantidadChange('peso', e.target.value)}
                        readOnly={editando.editando_campo === 'unidades'}
                        style={{ backgroundColor: editando.editando_campo === 'unidades' ? '#f0f0f0' : 'white' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editando.unidades_por_receta}
                        onChange={(e) => setEditando({ ...editando, unidades_por_receta: e.target.value })}
                        title="Unidades por receta"
                        style={{width: '60px'}}
                      />
                      /
                      <input
                        type="number"
                        step="0.01"
                        value={editando.peso_por_receta}
                        onChange={(e) => setEditando({ ...editando, peso_por_receta: e.target.value })}
                        title="Kg por receta"
                        style={{width: '60px'}}
                      />
                    </td>
                    <td>-</td>
                    <td>
                      <button className="btn-guardar" onClick={guardarEdicion}>Guardar</button>
                      <button className="btn-cancelar" onClick={cancelarEdicion}>Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{producto.nombre}</td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.9em'}}>
                        <span>${(producto.precio / producto.unidades_por_receta).toFixed(2)} U.</span>
                        <span>${(producto.precio / producto.peso_por_receta).toFixed(2)} Kg.</span>
                      </div>
                    </td>
                    <td>{producto.unidades?.toFixed(2) || 0}</td>
                    <td>{producto.peso_kg?.toFixed(2) || 0} kg</td>
                    <td>{producto.unidades_por_receta?.toFixed(1) || 1}u / {producto.peso_por_receta?.toFixed(2) || 1}kg</td>
                    <td>
                      {producto.receta && producto.receta.length > 0 ? (
                        <span className="receta-info">✓ {producto.receta.length} ingredientes</span>
                      ) : (
                        <span className="receta-info-vacia">Sin receta</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-receta" onClick={() => setMostrarReceta(producto.id)}>Receta</button>
                      <button className="btn-editar" onClick={() => iniciarEdicion(producto)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Modal de Receta */}
      {mostrarReceta && (
        <div className="modal-overlay" onClick={() => setMostrarReceta(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const producto = productos.find(p => p.id === mostrarReceta);
              return (
                <>
                  <h3>Receta de {producto.nombre}</h3>
                  
                  <div className="tipo-receta-info">
                    <div className="info-receta">
                      <label>Producción por receta:</label>
                      <p><strong>{producto.unidades_por_receta} unidades</strong> = <strong>{producto.peso_por_receta} kg</strong></p>
                      <small>({(producto.peso_por_receta / producto.unidades_por_receta * 1000).toFixed(0)}g por unidad)</small>
                    </div>
                    <div className="info-stock">
                      <label>Stock actual:</label>
                      <p><strong>{producto.unidades?.toFixed(2)} unidades</strong> ({producto.peso_kg?.toFixed(2)} kg)</p>
                    </div>
                  </div>
                  
                  <div className="receta-actual">
                    <h4>Ingredientes por preparación</h4>
                    {producto.receta && producto.receta.length > 0 ? (
                      <ul className="ingredientes-lista">
                        {producto.receta.map((ing, index) => (
                          <li key={ing.id || index}>
                            {ing.ingrediente}: {ing.cantidad} {ing.unidad}
                            <button 
                              className="btn-eliminar-ingrediente"
                              onClick={() => eliminarIngredienteReceta(producto.id, ing.id)}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="sin-ingredientes">No hay ingredientes en esta receta</p>
                    )}
                  </div>

                  <div className="agregar-ingrediente">
                    <h4>Agregar Ingrediente</h4>
                    <div className="form-group-ingrediente">
                      <select
                        value={ingredienteReceta.ingrediente}
                        onChange={(e) => setIngredienteReceta({ ...ingredienteReceta, ingrediente: e.target.value })}
                      >
                        <option value="">Seleccionar ingrediente...</option>
                        {stockItems.map(item => (
                          <option key={item.id} value={item.nombre}>
                            {item.nombre} (disponible: {item.cantidad} {item.unidad})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Cantidad"
                        value={ingredienteReceta.cantidad}
                        onChange={(e) => setIngredienteReceta({ ...ingredienteReceta, cantidad: e.target.value })}
                      />
                      <select
                        value={ingredienteReceta.unidad}
                        onChange={(e) => setIngredienteReceta({ ...ingredienteReceta, unidad: e.target.value })}
                      >
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="unidades">unidades</option>
                      </select>
                      <button onClick={() => agregarIngredienteReceta(producto.id)}>Agregar</button>
                    </div>
                  </div>

                  <div className="preparar-receta">
                    <h4>Preparar Producto</h4>
                    <p>
                      Ingresa cuántas veces deseas preparar esta receta. 
                      Cada preparación produce <strong>{producto.unidades_por_receta} unidades</strong> ({producto.peso_por_receta} kg).
                    </p>
                    <div className="form-group-preparar">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        defaultValue="1"
                        id={`cantidad-preparar-${producto.id}`}
                        placeholder="Cantidad de preparaciones"
                      />
                      <span className="unidad-label">preparación(es)</span>
                      <button 
                        className="btn-preparar"
                        onClick={() => {
                          const cantidad = parseFloat(document.getElementById(`cantidad-preparar-${producto.id}`).value);
                          prepararReceta(producto.id, cantidad);
                        }}
                      >
                        Preparar
                      </button>
                    </div>
                  </div>

                  <button className="btn-cerrar-modal" onClick={() => setMostrarReceta(null)}>
                    Cerrar
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;
