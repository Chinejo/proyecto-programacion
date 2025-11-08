import { useState, useEffect } from 'react';
import './Productos.css';
import { productosAPI, recetasAPI } from '../services/api';
import Modal from './Modal';

function Productos({ stockItems, setStockItems, reloadStock }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });
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
    if (nuevoProducto.nombre && nuevoProducto.precio && nuevoProducto.stock) {
      try {
        const producto = await productosAPI.create({
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
          stock: parseFloat(nuevoProducto.stock),
          tipo_receta: 'unidad' // Por defecto: receta por unidad
        });
        setProductos([...productos, producto]);
        setNuevoProducto({ nombre: '', precio: '', stock: '' });
        mostrarModal('¡Éxito!', 'Producto agregado correctamente', 'success');
      } catch (error) {
        mostrarModal('Error', `Error al agregar producto: ${error.message}`, 'error');
      }
    }
  };

  const cambiarTipoReceta = async (productoId, nuevoTipo) => {
    try {
      await productosAPI.update(productoId, { tipo_receta: nuevoTipo });
      setProductos(productos.map(p => {
        if (p.id === productoId) {
          return { ...p, tipo_receta: nuevoTipo };
        }
        return p;
      }));
    } catch (error) {
      mostrarModal('Error', `Error al cambiar tipo de receta: ${error.message}`, 'error');
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
      
      const unidadTexto = productoActualizado.tipo_receta === 'kg' ? `${cantidad} kg` : `${cantidad} unidades`;
      mostrarModal('¡Éxito!', `Se prepararon ${unidadTexto} de ${productoActualizado.nombre}`, 'success');
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
      tipo_receta: producto.tipo_receta || 'unidad'
    });
  };

  const guardarEdicion = async () => {
    if (!editando.nombre || !editando.nombre.trim()) {
      mostrarModal('Campo requerido', 'El nombre no puede estar vacío', 'warning');
      return;
    }

    try {
      await productosAPI.update(editando.id, {
        nombre: editando.nombre,
        precio: parseFloat(editando.precio),
        stock: parseInt(editando.stock),
        tipo_receta: editando.tipo_receta
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
        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio"
            step="0.01"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock inicial"
            value={nuevoProducto.stock}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
          />
          <button type="submit">Agregar Producto</button>
        </div>
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
              <th>Stock</th>
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
                      <input
                        type="number"
                        step="0.01"
                        value={editando.precio}
                        onChange={(e) => setEditando({ ...editando, precio: parseFloat(e.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editando.stock}
                        onChange={(e) => setEditando({ ...editando, stock: parseInt(e.target.value) })}
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
                    <td>${producto.precio}</td>
                    <td>{producto.stock}</td>
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
                  
                  <div className="tipo-receta-selector">
                    <label>Tipo de Receta:</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`tipo-receta-${producto.id}`}
                          value="unidad"
                          checked={producto.tipo_receta === 'unidad'}
                          onChange={(e) => cambiarTipoReceta(producto.id, e.target.value)}
                        />
                        <span>Por Unidad</span>
                        <small>(Ej: pasteles, medialunas - cada unidad usa X ingredientes)</small>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`tipo-receta-${producto.id}`}
                          value="kg"
                          checked={producto.tipo_receta === 'kg'}
                          onChange={(e) => cambiarTipoReceta(producto.id, e.target.value)}
                        />
                        <span>Por Kilogramo</span>
                        <small>(Ej: pan francés - se fabrica por kg, ingredientes para producir 1kg)</small>
                      </label>
                    </div>
                  </div>
                  
                  <div className="receta-actual">
                    <h4>Ingredientes (por {producto.tipo_receta === 'kg' ? 'kilogramo' : 'unidad'})</h4>
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
                      {producto.tipo_receta === 'kg' 
                        ? 'Ingresa cuántos kilogramos deseas preparar. Los ingredientes se descontarán proporcionalmente.' 
                        : 'Ingresa cuántas unidades deseas preparar. Los ingredientes se descontarán por cada unidad.'}
                    </p>
                    <div className="form-group-preparar">
                      <input
                        type="number"
                        min="0.01"
                        step={producto.tipo_receta === 'kg' ? '0.1' : '1'}
                        defaultValue={producto.tipo_receta === 'kg' ? '1' : '1'}
                        id={`cantidad-preparar-${producto.id}`}
                        placeholder={producto.tipo_receta === 'kg' ? 'Kilos a preparar' : 'Unidades a preparar'}
                      />
                      <span className="unidad-label">{producto.tipo_receta === 'kg' ? 'kg' : 'unidades'}</span>
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
