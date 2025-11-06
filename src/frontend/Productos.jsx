import { useState } from 'react';
import './Productos.css';

function Productos() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Pan Francés', precio: 150, stock: 50 },
    { id: 2, nombre: 'Medialunas', precio: 80, stock: 100 },
    { id: 3, nombre: 'Facturas', precio: 100, stock: 75 }
  ]);
  
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });
  const [editando, setEditando] = useState(null);

  const agregarProducto = (e) => {
    e.preventDefault();
    if (nuevoProducto.nombre && nuevoProducto.precio && nuevoProducto.stock) {
      const producto = {
        id: Date.now(),
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock)
      };
      setProductos([...productos, producto]);
      setNuevoProducto({ nombre: '', precio: '', stock: '' });
    }
  };

  const iniciarEdicion = (producto) => {
    setEditando(producto);
  };

  const guardarEdicion = () => {
    setProductos(productos.map(p => 
      p.id === editando.id ? editando : p
    ));
    setEditando(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  return (
    <div className="productos-container">
      <h2>Gestión de Productos</h2>
      
      <form className="productos-form" onSubmit={agregarProducto}>
        <h3>Agregar Nuevo Producto</h3>
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
        <h3>Lista de Productos</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
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
                      <button className="btn-editar" onClick={() => iniciarEdicion(producto)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Productos;
