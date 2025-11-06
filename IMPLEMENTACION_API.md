# 🥖 API REST y Base de Datos - Implementación Completa

## ✅ LO QUE SE HA IMPLEMENTADO

### Backend (FastAPI)

1. **Base de datos completa**:
   - `database.py`: Configuración de SQLAlchemy con SQLite
   - `models.py`: Modelos de BD para Stock, Productos, Recetas, Ventas
   - `schemas.py`: Schemas de Pydantic para validación
   - `main.py`: API REST completa con todos los endpoints

2. **Endpoints RESTful disponibles**:
   - **Stock**: GET, POST, PUT, DELETE `/api/stock`
   - **Productos**: GET, POST, PUT, DELETE `/api/productos`
   - **Recetas**: POST/DELETE ingredientes, POST preparar `/api/productos/{id}/receta`
   - **Ventas**: GET, POST `/api/ventas`
   - **Admin**: POST `/api/init-database` (inicializar con datos)

### Frontend Actualizado

1. **Servicio API** (`src/services/api.js`):
   - Funciones para todas las operaciones CRUD
   - Manejo de errores centralizado
   - Soporte para todos los endpoints

2. **Componentes actualizados**:
   - ✅ `App.jsx`: Carga datos desde API, maneja loading/error
   - ✅ `Stock.jsx`: CRUD completo conectado a la API
   - ⏳ `Productos.jsx`: NECESITA ACTUALIZACIÓN
   - ⏳ `Ventas.jsx`: NECESITA ACTUALIZACIÓN

## 🚀 CÓMO EJECUTAR

### 1. Iniciar el Backend

```bash
# Desde la raíz del proyecto
python -m uvicorn src.backend.main:app --reload --port 8000
```

El backend estará en: `http://localhost:8000`
Documentación interactiva: `http://localhost:8000/docs`

### 2. Inicializar la Base de Datos

Primera vez solamente - carga datos de ejemplo:

**Opción A - Desde el navegador:**
1. Abre `http://localhost:8000/docs`
2. Busca el endpoint `POST /api/init-database`
3. Click en "Try it out" y luego "Execute"

**Opción B - Con curl:**
```bash
curl -X POST http://localhost:8000/api/init-database
```

### 3. Iniciar el Frontend

```bash
# En otra terminal
npm run dev
```

El frontend estará en: `http://localhost:5173` (o 5174)

## 📋 PRÓXIMOS PASOS - Actualizar Componentes

### Productos.jsx

Necesita actualizarse para:
- Cargar productos desde API al montar
- Usar `productosAPI` para CRUD
- Usar `recetasAPI` para gestionar ingredientes
- Usar `recetasAPI.preparar()` para preparar recetas

Cambios principales:
```javascript
import { useEffect } from 'react';
import { productosAPI, recetasAPI } from '../services/api';

// En el componente:
useEffect(() => {
  loadProductos();
}, []);

const loadProductos = async () => {
  try {
    const data = await productosAPI.getAll();
    setProductos(data);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Al agregar producto:
const producto = await productosAPI.create({...});

// Al agregar ingrediente:
await recetasAPI.addIngrediente(productoId, {...});

// Al preparar receta:
await recetasAPI.preparar(productoId, cantidad);
// Luego recargar productos Y stock
```

### Ventas.jsx

Necesita actualizarse para:
- Cargar productos disponibles desde API
- Cargar historial de ventas desde API
- Usar `ventasAPI.create()` para crear ventas

Cambios principales:
```javascript
import { useEffect } from 'react';
import { productosAPI, ventasAPI } from '../services/api';

// Cargar productos y ventas:
useEffect(() => {
  loadProductos();
  loadVentas();
}, []);

// Al finalizar venta:
const venta = await ventasAPI.create({
  items: ventaActual.map(item => ({
    producto_id: item.producto.id,
    cantidad: item.cantidad
  }))
});
```

## 🗄️ ESTRUCTURA DE LA BASE DE DATOS

### Stock
- id, nombre, cantidad, unidad

### Productos
- id, nombre, precio, stock, tipo_receta ('unidad' | 'kg')

### IngredientesReceta
- id, producto_id, ingrediente (nombre), cantidad, unidad

### Ventas
- id, fecha, total

### ItemsVenta
- id, venta_id, producto_id, producto_nombre, producto_precio, cantidad

## 🔑 PUNTOS CLAVE

1. **Los datos hardcodeados se eliminan**: El frontend ahora carga TODO desde la API
2. **Estado compartido**: Stock se pasa entre Stock y Productos para sincronización
3. **Validaciones en backend**: La API valida stock, ingredientes, etc.
4. **Historial de ventas**: Se guarda nombre y precio del producto al momento de la venta
5. **Preparar recetas**: Descuenta stock automáticamente en el backend

## ⚠️ IMPORTANTE

- El backend DEBE estar corriendo antes de usar el frontend
- Ejecuta `/api/init-database` UNA SOLA VEZ para cargar datos iniciales
- Si hay errores de conexión, verifica que el backend esté en el puerto 8000
- La base de datos es SQLite (`panaderia.db` en la raíz del proyecto)

## 🧪 TESTING

Puedes probar todos los endpoints en: `http://localhost:8000/docs`

La documentación interactiva (Swagger) te permite:
- Ver todos los endpoints disponibles
- Probar requests directamente
- Ver los schemas de datos
- Verificar respuestas

## 📚 ARCHIVOS CREADOS/MODIFICADOS

**Backend:**
- `requirements.txt` - Dependencias de Python
- `src/backend/database.py` - Configuración de BD
- `src/backend/models.py` - Modelos ORM
- `src/backend/schemas.py` - Validación Pydantic
- `src/backend/main.py` - API FastAPI completa
- `src/backend/README.md` - Documentación del backend

**Frontend:**
- `src/services/api.js` - Cliente API
- `src/App.jsx` - Carga datos desde API
- `src/App.css` - Estilos para loading/error
- `src/frontend/Stock.jsx` - Conectado a la API
- `src/frontend/Stock.css` - Estilo mensaje vacío

**Pendientes de actualizar:**
- `src/frontend/Productos.jsx`
- `src/frontend/Ventas.jsx`
