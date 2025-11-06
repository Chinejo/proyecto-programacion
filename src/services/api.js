// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api';

// Función helper para manejar respuestas
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `Error ${response.status}`);
  }
  
  // Si es 204 No Content, no hay body
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// ==================== API DE STOCK ====================

export const stockAPI = {
  // Obtener todos los items del stock
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/stock`);
    return handleResponse(response);
  },

  // Obtener un item específico
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/stock/${id}`);
    return handleResponse(response);
  },

  // Crear un nuevo item
  create: async (stockData) => {
    const response = await fetch(`${API_BASE_URL}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData)
    });
    return handleResponse(response);
  },

  // Actualizar un item
  update: async (id, stockData) => {
    const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData)
    });
    return handleResponse(response);
  },

  // Eliminar un item
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// ==================== API DE PRODUCTOS ====================

export const productosAPI = {
  // Obtener todos los productos
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/productos`);
    return handleResponse(response);
  },

  // Obtener un producto específico
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`);
    return handleResponse(response);
  },

  // Crear un nuevo producto
  create: async (productoData) => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    });
    return handleResponse(response);
  },

  // Actualizar un producto
  update: async (id, productoData) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    });
    return handleResponse(response);
  },

  // Eliminar un producto
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// ==================== API DE RECETAS ====================

export const recetasAPI = {
  // Agregar ingrediente a una receta
  addIngrediente: async (productoId, ingredienteData) => {
    const response = await fetch(`${API_BASE_URL}/productos/${productoId}/receta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingredienteData)
    });
    return handleResponse(response);
  },

  // Eliminar ingrediente de una receta
  deleteIngrediente: async (productoId, ingredienteId) => {
    const response = await fetch(`${API_BASE_URL}/productos/${productoId}/receta/${ingredienteId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  // Preparar receta (descontar stock)
  preparar: async (productoId, cantidad) => {
    const response = await fetch(`${API_BASE_URL}/productos/${productoId}/preparar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    return handleResponse(response);
  }
};

// ==================== API DE VENTAS ====================

export const ventasAPI = {
  // Obtener todas las ventas
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/ventas`);
    return handleResponse(response);
  },

  // Obtener una venta específica
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ventas/${id}`);
    return handleResponse(response);
  },

  // Crear una nueva venta
  create: async (ventaData) => {
    const response = await fetch(`${API_BASE_URL}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ventaData)
    });
    return handleResponse(response);
  }
};

// ==================== API DE ADMIN ====================

export const adminAPI = {
  // Inicializar base de datos con datos de ejemplo
  initDatabase: async () => {
    const response = await fetch(`${API_BASE_URL}/init-database`, {
      method: 'POST'
    });
    return handleResponse(response);
  }
};
