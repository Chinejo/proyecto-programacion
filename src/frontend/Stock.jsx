import { useState } from 'react';
import './Stock.css';
import { stockAPI } from '../services/api';

function Stock({ stockItems, setStockItems, reloadStock }) {
  const [nuevoItem, setNuevoItem] = useState({ nombre: '', cantidad: '', unidad: 'kg' });
  const [loading, setLoading] = useState(false);

  const agregarItem = async (e) => {
    e.preventDefault();
    if (nuevoItem.nombre && nuevoItem.cantidad) {
      try {
        setLoading(true);
        const item = await stockAPI.create({
          nombre: nuevoItem.nombre,
          cantidad: parseFloat(nuevoItem.cantidad),
          unidad: nuevoItem.unidad
        });
        setStockItems([...stockItems, item]);
        setNuevoItem({ nombre: '', cantidad: '', unidad: 'kg' });
        alert('Item agregado correctamente');
      } catch (error) {
        alert(`Error al agregar item: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const modificarCantidad = async (id, nuevaCantidad) => {
    try {
      await stockAPI.update(id, { cantidad: parseFloat(nuevaCantidad) });
      setStockItems(stockItems.map(item => 
        item.id === id ? { ...item, cantidad: parseFloat(nuevaCantidad) } : item
      ));
    } catch (error) {
      alert(`Error al actualizar cantidad: ${error.message}`);
      // Recargar para sincronizar
      reloadStock();
    }
  };

  const eliminarItem = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;
    
    try {
      await stockAPI.delete(id);
      setStockItems(stockItems.filter(item => item.id !== id));
      alert('Item eliminado correctamente');
    } catch (error) {
      alert(`Error al eliminar item: ${error.message}`);
    }
  };

  return (
    <div className="stock-container">
      <h2>Gestión de Stock</h2>
      
      <form className="stock-form" onSubmit={agregarItem}>
        <h3>Agregar Nuevo Item</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre del item"
            value={nuevoItem.nombre}
            onChange={(e) => setNuevoItem({ ...nuevoItem, nombre: e.target.value })}
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Cantidad"
            step="0.01"
            value={nuevoItem.cantidad}
            onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: e.target.value })}
            disabled={loading}
          />
          <select 
            value={nuevoItem.unidad}
            onChange={(e) => setNuevoItem({ ...nuevoItem, unidad: e.target.value })}
            disabled={loading}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="unidades">unidades</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>

      <div className="stock-list">
        <h3>Inventario Actual</h3>
        {stockItems.length === 0 ? (
          <p className="empty-message">No hay items en el stock. Agrega algunos para comenzar.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(item => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={item.cantidad}
                      onChange={(e) => modificarCantidad(item.id, e.target.value)}
                      className="cantidad-input"
                    />
                  </td>
                  <td>{item.unidad}</td>
                  <td>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Stock;

