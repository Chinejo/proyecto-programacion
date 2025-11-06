import { useState } from 'react';
import './Stock.css';

function Stock() {
  const [stockItems, setStockItems] = useState([
    { id: 1, nombre: 'Harina', cantidad: 50, unidad: 'kg' },
    { id: 2, nombre: 'Azúcar', cantidad: 30, unidad: 'kg' },
    { id: 3, nombre: 'Levadura', cantidad: 10, unidad: 'kg' }
  ]);
  
  const [nuevoItem, setNuevoItem] = useState({ nombre: '', cantidad: '', unidad: 'kg' });

  const agregarItem = (e) => {
    e.preventDefault();
    if (nuevoItem.nombre && nuevoItem.cantidad) {
      const item = {
        id: Date.now(),
        nombre: nuevoItem.nombre,
        cantidad: parseFloat(nuevoItem.cantidad),
        unidad: nuevoItem.unidad
      };
      setStockItems([...stockItems, item]);
      setNuevoItem({ nombre: '', cantidad: '', unidad: 'kg' });
    }
  };

  const modificarCantidad = (id, nuevaCantidad) => {
    setStockItems(stockItems.map(item => 
      item.id === id ? { ...item, cantidad: parseFloat(nuevaCantidad) } : item
    ));
  };

  const eliminarItem = (id) => {
    setStockItems(stockItems.filter(item => item.id !== id));
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
          />
          <input
            type="number"
            placeholder="Cantidad"
            step="0.01"
            value={nuevoItem.cantidad}
            onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: e.target.value })}
          />
          <select 
            value={nuevoItem.unidad}
            onChange={(e) => setNuevoItem({ ...nuevoItem, unidad: e.target.value })}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="unidades">unidades</option>
          </select>
          <button type="submit">Agregar</button>
        </div>
      </form>

      <div className="stock-list">
        <h3>Inventario Actual</h3>
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
      </div>
    </div>
  );
}

export default Stock;
