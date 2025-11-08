# Cambios en la Base de Datos - Sistema de Recetas y Ventas

## Resumen de Cambios

Se ha modificado la estructura de la base de datos para mejorar el manejo de recetas, stock y ventas, eliminando la distinción entre "recetas por unidad" y "recetas por kilogramo" y adoptando un sistema unificado que rastrea tanto unidades como peso.

## Cambios en la Base de Datos

### Tabla `productos`

**Campos eliminados:**
- `stock` (Float) - Stock general
- `tipo_receta` (Enum) - Tipo de receta (unidad/kg)

**Campos agregados:**
- `unidades` (Float) - Cantidad de unidades disponibles en stock
- `peso_kg` (Float) - Peso total en kilogramos disponible en stock
- `unidades_por_receta` (Float) - Cuántas unidades produce una preparación de la receta
- `peso_por_receta` (Float) - Cuántos kilogramos produce una preparación de la receta

### Tabla `items_venta`

**Campos modificados:**
- `cantidad` (Integer → Float) - Ahora permite valores fraccionarios (ej: 0.25 para 1/4 de torta)

**Campos agregados:**
- `tipo_venta` (Enum: 'unidad' | 'peso') - Indica si se vendió por unidad o por peso
- `cantidad_peso_kg` (Float, nullable) - Peso vendido si el tipo de venta es por peso

## Nueva Lógica del Sistema

### 1. Recetas

Cada producto tiene una receta que define:
- Los ingredientes necesarios y sus cantidades
- Cuántas **unidades** produce (`unidades_por_receta`)
- Cuánto **peso total** produce en kg (`peso_por_receta`)

**Ejemplo:**
```python
Producto: "Pan Francés"
- unidades_por_receta: 8.0  # Produce 8 rodajas
- peso_por_receta: 1.0      # Produce 1 kg total
# Relación: 1 kg = 8 rodajas → cada rodaja pesa 0.125 kg (125g)
```

### 2. Preparar Recetas

Al preparar una receta:
1. Se descuentan los ingredientes del stock (multiplicados por la cantidad de preparaciones)
2. Se agregan al producto:
   - `unidades_por_receta × cantidad_preparaciones` unidades
   - `peso_por_receta × cantidad_preparaciones` kilogramos

**Ejemplo:**
```
Preparar 2 veces la receta de Pan Francés:
- Descuenta ingredientes × 2
- Agrega al stock: 16 unidades (8 × 2) y 2 kg (1 × 2)
```

### 3. Ventas

Ahora se puede vender de dos formas:

#### A) Venta por Unidad
```json
{
  "producto_id": 1,
  "cantidad": 5.5,              // 5.5 unidades (permite fracciones)
  "tipo_venta": "unidad",
  "cantidad_peso_kg": null
}
```
- Descuenta `5.5` unidades del stock
- Calcula y descuenta el peso proporcional: `5.5 × (peso_por_receta / unidades_por_receta)` kg
- Precio: `precio × cantidad`

#### B) Venta por Peso
```json
{
  "producto_id": 1,
  "cantidad": 0.8,              // Se usa como referencia
  "tipo_venta": "peso",
  "cantidad_peso_kg": 0.8       // 0.8 kg
}
```
- Descuenta `0.8` kg del stock
- Calcula y descuenta unidades proporcionales: `0.8 / (peso_por_receta / unidades_por_receta)` unidades
- Precio: `(precio / kg_por_unidad) × cantidad_peso_kg`

### 4. Ejemplos Prácticos

#### Ejemplo 1: Torta de Chocolate
```python
# Configuración
precio: 5000 (por torta entera)
unidades_por_receta: 1.0
peso_por_receta: 1.5  # 1.5 kg por torta

# Venta por unidad: 0.25 tortas (1/4)
cantidad: 0.25
tipo_venta: "unidad"
# Descuenta: 0.25 unidades y 0.375 kg (0.25 × 1.5)
# Precio: 5000 × 0.25 = 1250

# Venta por peso: 0.5 kg
cantidad_peso_kg: 0.5
tipo_venta: "peso"
# Descuenta: 0.5 kg y 0.333 unidades (0.5 / 1.5)
# Precio: (5000 / 1.5) × 0.5 = 1666.67
```

#### Ejemplo 2: Pan Francés
```python
# Configuración
precio: 1600 (por kg, que son 8 rodajas)
unidades_por_receta: 8.0
peso_por_receta: 1.0

# Venta por unidad: 3 rodajas
cantidad: 3.0
tipo_venta: "unidad"
# Descuenta: 3 unidades y 0.375 kg (3 × 0.125)
# Precio: 1600 × (3 / 8) = 600

# Venta por peso: 0.8 kg
cantidad_peso_kg: 0.8
tipo_venta: "peso"
# Descuenta: 0.8 kg y 6.4 unidades (0.8 × 8)
# Precio: 1600 × 0.8 = 1280
```

## Migración de Base de Datos Existente

Si ya tienes una base de datos con la estructura antigua, ejecuta:

```bash
python src/backend/migrate_db.py
```

Este script:
1. Hace backup de las tablas existentes
2. Crea las nuevas tablas con la estructura actualizada
3. Migra los datos aplicando conversiones razonables:
   - Para productos "por kg": asume 8 unidades por kg
   - Para productos "por unidad": asume 50g por unidad
4. Convierte las ventas antiguas a "venta por unidad"

## Pasos para Implementar

1. **Backup de la base de datos actual** (si existe):
   ```bash
   copy panaderia.db panaderia_backup.db
   ```

2. **Ejecutar migración** (si tienes datos existentes):
   ```bash
   python src/backend/migrate_db.py
   ```

3. **O eliminar la base de datos** para empezar desde cero:
   ```bash
   rm panaderia.db
   ```

4. **Iniciar el servidor**:
   ```bash
   # El servidor recreará las tablas automáticamente
   python -m uvicorn src.backend.main:app --reload
   ```

5. **Inicializar con datos de ejemplo** (opcional):
   ```bash
   # Hacer POST a http://localhost:8000/api/init-database
   ```

## Próximos Pasos

Se necesitará actualizar el frontend para:
1. Mostrar los nuevos campos en la gestión de productos
2. Agregar selector de tipo de venta (unidad/peso) en ventas
3. Mostrar tanto unidades como peso en el stock
4. Actualizar la interfaz de preparación de recetas

## Archivos Modificados

- `src/backend/models.py` - Modelos de la base de datos
- `src/backend/schemas.py` - Schemas de Pydantic para validación
- `src/backend/main.py` - Lógica de endpoints (preparar receta y crear venta)
- `src/backend/migrate_db.py` - Script de migración (nuevo)
