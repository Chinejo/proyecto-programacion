# Resumen de Cambios - Sistema de Recetas y Ventas Mejorado

## ✅ Cambios Completados

### 🔧 Backend

#### 1. Modelos (`src/backend/models.py`)
- ✅ Eliminado `TipoRecetaEnum` (ya no hay tipos de receta)
- ✅ Agregado `TipoVentaEnum` (unidad/peso)
- ✅ Tabla `productos`:
  - Eliminado: `stock`, `tipo_receta`
  - Agregado: `unidades`, `peso_kg`, `unidades_por_receta`, `peso_por_receta`
- ✅ Tabla `items_venta`:
  - Modificado: `cantidad` (Integer → Float)
  - Agregado: `tipo_venta`, `cantidad_peso_kg`

#### 2. Schemas (`src/backend/schemas.py`)
- ✅ Actualizado `ProductoBase` con los nuevos campos
- ✅ Actualizado `ItemVentaBase` con tipo de venta y cantidad de peso
- ✅ Eliminado referencias a `TipoReceta`

#### 3. API (`src/backend/main.py`)
- ✅ Función `preparar_receta`:
  - Ahora agrega exactamente `unidades_por_receta` y `peso_por_receta` al stock
  - Multiplica por la cantidad de preparaciones
- ✅ Función `create_venta`:
  - Soporta venta por UNIDAD y por PESO
  - Calcula automáticamente la conversión peso-unidad
  - Descuenta correctamente del stock en ambos casos
  - Valida stock disponible según tipo de venta
- ✅ Función `init_database`:
  - Actualizada con datos de ejemplo usando la nueva estructura
  - 5 productos con recetas completas y stock inicial

#### 4. Migración (`src/backend/migrate_db.py`)
- ✅ Script creado para migrar bases de datos existentes
- ✅ Convierte automáticamente la estructura antigua a la nueva
- ✅ Hace backup de datos antes de migrar

### 🎨 Frontend

#### 1. Componente Productos (`src/frontend/Productos.jsx`)
- ✅ Formulario de agregar producto:
  - Agregados campos: unidades, peso_kg, unidades_por_receta, peso_por_receta
  - Eliminados campos antiguos
- ✅ Tabla de productos:
  - Muestra stock en unidades y kg
  - Muestra la relación de receta (u/kg)
  - Edición de todos los campos nuevos
- ✅ Modal de receta:
  - Eliminado selector de tipo de receta
  - Muestra información de producción por receta
  - Muestra stock actual (unidades y peso)
  - Preparar receta ahora pregunta "cuántas preparaciones"

#### 2. Componente Ventas (`src/frontend/Ventas.jsx`)
- ✅ Formulario de venta:
  - Agregado selector de tipo de venta (Unidad/Peso)
  - Input permite valores decimales
  - Muestra stock en unidades y kg
- ✅ Tabla de venta actual:
  - Muestra tipo de venta de cada item
  - Calcula subtotal correctamente según tipo de venta
  - Permite modificar cantidad con decimales
- ✅ Historial de ventas:
  - Muestra tipo de venta y cantidad en cada item

#### 3. Estilos CSS
- ✅ `Productos.css`: Estilos para información de receta y stock
- ✅ `Ventas.css`: Estilos para badges de tipo de venta

### 📄 Documentación

- ✅ `CAMBIOS_BD.md`: Documentación completa de los cambios
- ✅ Este archivo de resumen

## 🚀 Cómo Usar el Sistema Actualizado

### Paso 1: Preparar la Base de Datos

**Opción A - Empezar desde cero (recomendado):**
```powershell
# Eliminar base de datos actual
Remove-Item panaderia.db -ErrorAction SilentlyContinue
```

**Opción B - Migrar datos existentes:**
```powershell
# Hacer backup
Copy-Item panaderia.db panaderia_backup.db

# Ejecutar migración
python src/backend/migrate_db.py
```

### Paso 2: Iniciar el Backend

```powershell
python -m uvicorn src.backend.main:app --reload
```

### Paso 3: Inicializar con Datos de Ejemplo

Abrir el navegador en `http://localhost:8000/docs` y ejecutar:
- POST `/api/init-database`

Esto creará:
- 6 items de stock (Harina, Azúcar, Levadura, Manteca, Leche, Agua)
- 5 productos con recetas completas:
  - **Pan Francés**: 8 unidades/kg, precio $1600/kg
  - **Medialunas**: 12 unidades/0.24kg, precio $80/unidad
  - **Facturas**: 10 unidades/0.3kg, precio $100/unidad
  - **Torta de Chocolate**: 1 unidad/1.5kg, precio $5000/unidad
  - **Croissants**: 6 unidades/0.42kg, precio $120/unidad

### Paso 4: Iniciar el Frontend

```powershell
npm run dev
```

## 🎯 Casos de Uso

### 1. Agregar un Producto

1. Ir a "Productos"
2. Completar el formulario:
   - Nombre: ej. "Pan Francés"
   - Precio: ej. 1600 (precio de referencia)
   - Stock inicial (unidades): ej. 0
   - Stock inicial (kg): ej. 0
   - **Unidades por receta**: ej. 8 (1 receta produce 8 rodajas)
   - **Peso por receta**: ej. 1 (1 receta produce 1 kg)
3. Clic en "Agregar Producto"

### 2. Configurar Receta

1. Clic en "Receta" del producto
2. Agregar ingredientes uno por uno
3. Las cantidades son por preparación única

### 3. Preparar Producto

1. En el modal de receta, ingresar cuántas veces preparar
2. Ejemplo: Preparar 3 veces el Pan Francés
   - Descuenta ingredientes × 3
   - Agrega al stock: 24 unidades (8 × 3) y 3 kg (1 × 3)

### 4. Vender por Unidad

1. Ir a "Ventas"
2. Seleccionar producto
3. Seleccionar "Por Unidad"
4. Ingresar cantidad (ej. 2.5 para 2.5 unidades)
5. El sistema descuenta unidades y peso proporcional

### 5. Vender por Peso

1. Ir a "Ventas"
2. Seleccionar producto
3. Seleccionar "Por Peso (kg)"
4. Ingresar peso (ej. 0.8 para 0.8 kg)
5. El sistema descuenta peso y unidades proporcionales

## 📊 Ejemplos Prácticos

### Ejemplo 1: Pan Francés
- Configuración: 8 unidades por kg
- Precio: $1600 (por kg, o $200 por unidad)
- **Venta por unidad**: 3 rodajas = $600
- **Venta por peso**: 0.5 kg = $800 (4 rodajas)

### Ejemplo 2: Torta de Chocolate
- Configuración: 1 torta = 1.5 kg
- Precio: $5000 (por torta entera)
- **Venta por unidad**: 0.25 tortas (1/4) = $1250
- **Venta por peso**: 0.5 kg = $1666.67 (1/3 de torta)

## 🐛 Verificaciones

### Backend
```powershell
# Verificar que no hay errores
python -c "from src.backend import models, schemas, main; print('✅ Backend OK')"
```

### Frontend
```powershell
# Verificar que el frontend compila
npm run build
```

## ✨ Características Nuevas

1. **Sistema unificado de recetas**: Un solo tipo que define unidades y peso producidos
2. **Doble tracking de stock**: Unidades y peso simultáneamente
3. **Ventas flexibles**: Por unidad o por peso, con conversión automática
4. **Precisión decimal**: Vender fracciones (0.25 tortas, 0.8 kg de pan)
5. **Cálculo automático de precios**: Según el tipo de venta y la relación peso-unidad

## 🎉 Listo!

El sistema ahora está completamente funcional con la nueva lógica de recetas y ventas.
