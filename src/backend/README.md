# Panadería Backend - FastAPI

## Instalación

1. Asegúrate de tener Python 3.8+ instalado
2. Navega a la raíz del proyecto
3. Instala las dependencias:

```bash
pip install -r requirements.txt
```

## Ejecutar el servidor

Desde la raíz del proyecto:

```bash
# Con uvicorn directamente
uvicorn src.backend.main:app --reload --port 8000

# O con Python
python -m uvicorn src.backend.main:app --reload --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

## Inicializar la Base de Datos

La primera vez que ejecutes el servidor, debes inicializar la base de datos con datos de ejemplo:

```bash
# Hacer una petición POST a:
POST http://localhost:8000/api/init-database
```

O desde el navegador abre: `http://localhost:8000/docs` y ejecuta el endpoint `/api/init-database`

## Documentación de la API

Una vez que el servidor esté corriendo:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Estructura de la API

### Stock
- `GET /api/stock` - Obtener todos los items del stock
- `GET /api/stock/{id}` - Obtener un item específico
- `POST /api/stock` - Crear un nuevo item
- `PUT /api/stock/{id}` - Actualizar un item
- `DELETE /api/stock/{id}` - Eliminar un item

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/{id}` - Obtener un producto específico
- `POST /api/productos` - Crear un nuevo producto
- `PUT /api/productos/{id}` - Actualizar un producto
- `DELETE /api/productos/{id}` - Eliminar un producto

### Recetas
- `POST /api/productos/{id}/receta` - Agregar ingrediente a receta
- `DELETE /api/productos/{id}/receta/{ingrediente_id}` - Eliminar ingrediente de receta
- `POST /api/productos/{id}/preparar` - Preparar receta (descontar stock)

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `GET /api/ventas/{id}` - Obtener una venta específica
- `POST /api/ventas` - Crear una nueva venta

## Base de Datos

Se utiliza SQLite con el archivo `panaderia.db` que se crea automáticamente en la raíz del proyecto.
