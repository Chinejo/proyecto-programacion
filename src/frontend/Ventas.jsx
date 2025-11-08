import { useState, useEffect } from 'react';
import './Ventas.css';
import { productosAPI, ventasAPI } from '../services/api';
import Modal from './Modal';

function Ventas() {
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaActual, setVentaActual] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [tipoVenta, setTipoVenta] = useState('unidad'); // 'unidad' o 'peso'
  const [ventas, setVentas] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });

  const getSafeNumber = (value, fallback = 0) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getUnidadesPorReceta = (producto) => {
    if (!producto) return 1;
    const unidades = getSafeNumber(producto.unidades_por_receta, 1);
    return unidades > 0 ? unidades : 1;
  };

  const getPesoPorReceta = (producto) => {
    if (!producto) return 1;
    const peso = getSafeNumber(producto.peso_por_receta, 1);
    return peso > 0 ? peso : 1;
  };

  const getPrecioPorUnidad = (producto) => {
    if (!producto) return 0;
    const unidades = getUnidadesPorReceta(producto);
    return unidades > 0 ? producto.precio / unidades : producto.precio;
  };

  const getPrecioPorKg = (producto) => {
    if (!producto) return 0;
    const peso = getPesoPorReceta(producto);
    return peso > 0 ? producto.precio / peso : producto.precio;
  };

  // Cargar productos y ventas al montar
  useEffect(() => {
    loadData();
  }, []);

  const mostrarModal = (titulo, mensaje, tipo = 'info') => {
    setModal({ isOpen: true, titulo, mensaje, tipo });
  };

  const cerrarModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [productosData, ventasData] = await Promise.all([
        productosAPI.getAll(),
        ventasAPI.getAll()
      ]);
      setProductosDisponibles(productosData);
      setVentas(ventasData);
    } catch (error) {
      mostrarModal('Error', `Error al cargar datos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const agregarProductoVenta = () => {
    if (!productoSeleccionado) return;

    const producto = productosDisponibles.find(p => p.id === parseInt(productoSeleccionado));
    const cantidadNum = parseFloat(cantidad);

    // Validar stock según tipo de venta
    if (tipoVenta === 'unidad') {
      if (cantidadNum > producto.unidades) {
        mostrarModal('Stock insuficiente', `No hay suficientes unidades disponibles. Stock: ${producto.unidades} unidades`, 'warning');
        return;
      }
    } else { // peso
      if (cantidadNum > producto.peso_kg) {
        mostrarModal('Stock insuficiente', `No hay suficiente peso disponible. Stock: ${producto.peso_kg} kg`, 'warning');
        return;
      }
    }

    const itemExistente = ventaActual.find(item => 
      item.producto.id === producto.id && item.tipo_venta === tipoVenta
    );
    
    if (itemExistente) {
      setVentaActual(ventaActual.map(item => 
        item.producto.id === producto.id && item.tipo_venta === tipoVenta
          ? { ...item, cantidad: item.cantidad + cantidadNum }
          : item
      ));
    } else {
      setVentaActual([...ventaActual, { 
        producto, 
        cantidad: cantidadNum,
        tipo_venta: tipoVenta
      }]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const modificarCantidad = (index, nuevaCantidad) => {
    const item = ventaActual[index];
    const producto = productosDisponibles.find(p => p.id === item.producto.id);
    const nuevaCantidadNum = parseFloat(nuevaCantidad);
    
    // Validar stock según tipo de venta
    if (item.tipo_venta === 'unidad') {
      if (nuevaCantidadNum > producto.unidades) {
        mostrarModal('Stock insuficiente', `No hay suficientes unidades. Stock: ${producto.unidades} unidades`, 'warning');
        return;
      }
    } else { // peso
      if (nuevaCantidadNum > producto.peso_kg) {
        mostrarModal('Stock insuficiente', `No hay suficiente peso. Stock: ${producto.peso_kg} kg`, 'warning');
        return;
      }
    }
    
    setVentaActual(ventaActual.map((item, i) =>
      i === index ? { ...item, cantidad: nuevaCantidadNum } : item
    ));
  };

  const eliminarProductoVenta = (index) => {
    setVentaActual(ventaActual.filter((_, i) => i !== index));
  };

  const calcularSubtotal = (item) => {
    const producto = item.producto;
    const cantidad = getSafeNumber(item.cantidad, 0);

    if (item.tipo_venta === 'unidad') {
      const precioUnidad = getPrecioPorUnidad(producto);
      return precioUnidad * cantidad;
    }

    const precioKg = getPrecioPorKg(producto);
    return precioKg * cantidad;
  };

  const calcularTotal = () => {
    return ventaActual.reduce((total, item) => total + calcularSubtotal(item), 0);
  };

  const finalizarVenta = async () => {
    if (ventaActual.length === 0) {
      mostrarModal('Venta vacía', 'Agregue productos a la venta', 'warning');
      return;
    }

    try {
      const items = ventaActual.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        tipo_venta: item.tipo_venta,
        cantidad_peso_kg: item.tipo_venta === 'peso' ? item.cantidad : null
      }));

      await ventasAPI.create({ items });
      
      await loadData();
      setVentaActual([]);
      mostrarModal('¡Éxito!', 'Venta registrada exitosamente', 'success');
    } catch (error) {
      mostrarModal('Error', `Error al registrar venta: ${error.message}`, 'error');
    }
  };

  const cancelarVenta = () => {
    setVentaActual([]);
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = String(fecha.getFullYear());
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    
    return {
      fecha: `${dia}-${mes}-${año}`,
      hora: `${horas}:${minutos}`
    };
  };

  return (
    <div className="ventas-container">
      <Modal 
        isOpen={modal.isOpen}
        onClose={cerrarModal}
        titulo={modal.titulo}
        mensaje={modal.mensaje}
        tipo={modal.tipo}
      />
      
      <h2>Registrar Venta</h2>
      
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
      <div className="venta-form">
        <h3>Nueva venta:</h3>
        <div className="form-group">
          <select 
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar producto...</option>
            {productosDisponibles.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - ${getPrecioPorUnidad(producto).toFixed(2)} /u | ${getPrecioPorKg(producto).toFixed(2)} /kg (Stock: {producto.unidades?.toFixed(2)} u / {producto.peso_kg?.toFixed(2)} kg)
              </option>
            ))}
          </select>
          <select
            value={tipoVenta}
            onChange={(e) => setTipoVenta(e.target.value)}
          >
            <option value="unidad">Por Unidad</option>
            <option value="peso">Por Peso (kg)</option>
          </select>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder={tipoVenta === 'unidad' ? 'Cantidad (unidades)' : 'Cantidad (kg)'}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <button onClick={agregarProductoVenta}>Agregar</button>
        </div>
      </div>

      {ventaActual.length > 0 && (
        <div className="venta-actual">
          <h3>Productos en la venta:</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Precio Base</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventaActual.map((item, index) => (
                <tr key={index}>
                  <td>{item.producto.nombre}</td>
                  <td>{item.tipo_venta === 'unidad' ? 'Unidad' : 'Peso (kg)'}</td>
                  <td>
                    {item.tipo_venta === 'unidad'
                      ? `$${getPrecioPorUnidad(item.producto).toFixed(2)} /u`
                      : `$${getPrecioPorKg(item.producto).toFixed(2)} /kg`}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.cantidad}
                      onChange={(e) => modificarCantidad(index, e.target.value)}
                      className="cantidad-input"
                    />
                    <span className="unidad-label">
                      {item.tipo_venta === 'unidad' ? 'u' : 'kg'}
                    </span>
                  </td>
                  <td>${calcularSubtotal(item).toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarProductoVenta(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="venta-total">
            <h3>Total: ${calcularTotal().toFixed(2)}</h3>
            <div className="venta-acciones">
              <button className="btn-finalizar" onClick={finalizarVenta}>Finalizar Venta</button>
              <button className="btn-cancelar" onClick={cancelarVenta}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {ventas.length > 0 && (
        <div className="historial-ventas">
          <h3>Historial de ventas:</h3>
          {ventas.map(venta => {
            const { fecha, hora } = formatearFecha(venta.fecha);
            return (
              <div key={venta.id} className="venta-card">
                <div className="venta-header">
                  <span className="venta-fecha">{fecha} - {hora}</span>
                  <span className="venta-total">Total: ${Number(venta.total).toFixed(2)}</span>
                </div>
                <ul className="venta-items">
                  {venta.items.map(item => {
                    const cantidadBase = item.tipo_venta === 'unidad'
                      ? getSafeNumber(item.cantidad, 0)
                      : getSafeNumber(item.cantidad_peso_kg ?? item.cantidad, 0);
                    const subtotal = (item.producto_precio || 0) * cantidadBase;
                    const sufijo = item.tipo_venta === 'unidad' ? 'u' : 'kg';

                    return (
                      <li key={item.id || item.producto_id}>
                        {item.producto_nombre || item.producto?.nombre} · {cantidadBase} {sufijo} × ${getSafeNumber(item.producto_precio, 0).toFixed(2)} = ${subtotal.toFixed(2)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default Ventas;
