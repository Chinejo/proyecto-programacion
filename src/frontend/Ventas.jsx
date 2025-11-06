import { useState } from 'react';
import './Ventas.css';

function Ventas() {
  // Productos disponibles (en una app real, vendrían de un estado global o API)
  const [productosDisponibles] = useState([
    { id: 1, nombre: 'Pan Francés', precio: 150, stock: 50 },
    { id: 2, nombre: 'Medialunas', precio: 80, stock: 100 },
    { id: 3, nombre: 'Facturas', precio: 100, stock: 75 },
    { id: 4, nombre: 'Pan Integral', precio: 200, stock: 30 },
    { id: 5, nombre: 'Croissants', precio: 120, stock: 40 }
  ]);

  const [ventaActual, setVentaActual] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [ventas, setVentas] = useState([]);

  const agregarProductoVenta = () => {
    if (!productoSeleccionado) return;

    const producto = productosDisponibles.find(p => p.id === parseInt(productoSeleccionado));
    const cantidadNum = parseInt(cantidad);

    if (cantidadNum > producto.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    const itemExistente = ventaActual.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      setVentaActual(ventaActual.map(item => 
        item.producto.id === producto.id 
          ? { ...item, cantidad: item.cantidad + cantidadNum }
          : item
      ));
    } else {
      setVentaActual([...ventaActual, { producto, cantidad: cantidadNum }]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const modificarCantidad = (productoId, nuevaCantidad) => {
    const producto = productosDisponibles.find(p => p.id === productoId);
    if (nuevaCantidad > producto.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }
    
    setVentaActual(ventaActual.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad: parseInt(nuevaCantidad) }
        : item
    ));
  };

  const eliminarProductoVenta = (productoId) => {
    setVentaActual(ventaActual.filter(item => item.producto.id !== productoId));
  };

  const calcularTotal = () => {
    return ventaActual.reduce((total, item) => 
      total + (item.producto.precio * item.cantidad), 0
    );
  };

  const finalizarVenta = () => {
    if (ventaActual.length === 0) {
      alert('Agregue productos a la venta');
      return;
    }

    const nuevaVenta = {
      id: Date.now(),
      fecha: new Date().toLocaleString(),
      items: [...ventaActual],
      total: calcularTotal()
    };

    setVentas([nuevaVenta, ...ventas]);
    setVentaActual([]);
    alert('Venta registrada exitosamente!');
  };

  const cancelarVenta = () => {
    setVentaActual([]);
  };

  return (
    <div className="ventas-container">
      <h2>Registrar Venta</h2>
      
      <div className="venta-form">
        <h3>Nueva Venta</h3>
        <div className="form-group">
          <select 
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar producto...</option>
            {productosDisponibles.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - ${producto.precio} (Stock: {producto.stock})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <button onClick={agregarProductoVenta}>Agregar</button>
        </div>
      </div>

      {ventaActual.length > 0 && (
        <div className="venta-actual">
          <h3>Productos en la Venta</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventaActual.map(item => (
                <tr key={item.producto.id}>
                  <td>{item.producto.nombre}</td>
                  <td>${item.producto.precio}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => modificarCantidad(item.producto.id, e.target.value)}
                      className="cantidad-input"
                    />
                  </td>
                  <td>${item.producto.precio * item.cantidad}</td>
                  <td>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarProductoVenta(item.producto.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="venta-total">
            <h3>Total: ${calcularTotal()}</h3>
            <div className="venta-acciones">
              <button className="btn-finalizar" onClick={finalizarVenta}>Finalizar Venta</button>
              <button className="btn-cancelar" onClick={cancelarVenta}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {ventas.length > 0 && (
        <div className="historial-ventas">
          <h3>Historial de Ventas</h3>
          {ventas.map(venta => (
            <div key={venta.id} className="venta-card">
              <div className="venta-header">
                <span className="venta-fecha">{venta.fecha}</span>
                <span className="venta-total">Total: ${venta.total}</span>
              </div>
              <ul className="venta-items">
                {venta.items.map(item => (
                  <li key={item.producto.id}>
                    {item.producto.nombre} x {item.cantidad} = ${item.producto.precio * item.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Ventas;
