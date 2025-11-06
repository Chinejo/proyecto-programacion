# Sistema de Recetas - Panadería SPA

## 📝 Funcionalidades Implementadas

### Gestión de Recetas
Ahora cada producto puede tener una receta asociada que define los ingredientes necesarios para producirlo.

### 🆕 Tipos de Recetas

El sistema distingue entre **dos tipos de recetas**:

#### 1. **Recetas por Unidad** 🧁
Para productos que se fabrican unidad por unidad, donde cada unidad consume una cantidad específica de ingredientes.

**Casos de uso:**
- **Medialunas**: Cada medialuna usa poca cantidad de ingredientes (30g harina, 10g azúcar)
- **Facturas**: Cada factura usa cantidades moderadas (40g harina, 15g azúcar)
- **Tortas/Pasteles**: Cada torta usa MUCHOS ingredientes (500g harina, 400g azúcar)

**Ejemplo:** Si preparas 10 medialunas, se consumen 300g de harina (10 × 30g)

#### 2. **Recetas por Kilogramo** 🍞
Para productos que se fabrican en lotes por peso, típicamente pan que luego se vende por unidad o kg.

**Casos de uso:**
- **Pan Francés**: Se fabrica por kilos (ej: 5kg de pan), la receta define ingredientes para producir 1kg
- **Pan Integral**: Similar, producción por lotes grandes
- **Masas**: Producción en grandes cantidades

**Ejemplo:** Si preparas 5kg de pan francés, se consumen 2.5kg de harina (5 × 0.5kg)

### Características:

1. **Seleccionar Tipo de Receta**:
   - Radio buttons para elegir entre "Por Unidad" o "Por Kilogramo"
   - Cada tipo incluye una descripción clara de su uso
   - Se puede cambiar en cualquier momento

2. **Ver Recetas**: 
   - Botón "Receta" en cada producto
   - Muestra los ingredientes con sus cantidades
   - Indica el tipo de receta (por unidad o por kg)
   - Muestra cuántos ingredientes tiene la receta

3. **Agregar Ingredientes**:
   - Selecciona ingredientes desde el stock disponible
   - Define la cantidad por unidad de producto
   - Valida que el ingrediente exista en el stock

4. **Eliminar Ingredientes**:
   - Botón "✕" en cada ingrediente
   - Actualización inmediata de la receta

5. **Preparar Productos**:
   - Interfaz adaptada según el tipo de receta
   - Para **recetas por kg**: Input acepta decimales (ej: 1.5 kg)
   - Para **recetas por unidad**: Input acepta solo números enteros
   - Descuenta automáticamente los ingredientes del stock
   - Aumenta el stock del producto final
   - Valida que haya suficiente stock de ingredientes

## 🔄 Flujo de Trabajo

### Ejemplo 1: Preparar 5kg de Pan Francés (Receta por KG)

**Receta del Pan Francés (por 1kg):**
- Harina: 0.5 kg
- Levadura: 0.02 kg

**Proceso:**
1. Ir a la vista "Productos"
2. Click en "Receta" del Pan Francés
3. Verificar que el tipo de receta sea "Por Kilogramo"
4. Ingresar "5" en cantidad a preparar
5. Click en "Preparar"

**Resultado:**
- Stock de Harina: 50 kg → 47.5 kg (-2.5 kg = 5 × 0.5)
- Stock de Levadura: 10 kg → 9.9 kg (-0.1 kg = 5 × 0.02)
- Stock de Pan Francés: 50 → 55 (+5 kg)

### Ejemplo 2: Preparar 10 Medialunas (Receta por UNIDAD)

**Receta de Medialunas (por 1 unidad):**
- Harina: 0.03 kg (30g)
- Azúcar: 0.01 kg (10g)
- Levadura: 0.001 kg (1g)

**Proceso:**
1. Ir a la vista "Productos"
2. Click en "Receta" de Medialunas
3. Verificar que el tipo de receta sea "Por Unidad"
4. Ingresar "10" en cantidad a preparar
5. Click en "Preparar"

**Resultado:**
- Stock de Harina: 50 kg → 49.7 kg (-0.3 kg = 10 × 0.03)
- Stock de Azúcar: 30 kg → 29.9 kg (-0.1 kg = 10 × 0.01)
- Stock de Levadura: 10 kg → 9.99 kg (-0.01 kg = 10 × 0.001)
- Stock de Medialunas: 100 → 110 (+10 unidades)

### Ejemplo 3: Preparar 1 Torta de Chocolate (Receta por UNIDAD con muchos ingredientes)

**Receta de Torta (por 1 unidad):**
- Harina: 0.5 kg
- Azúcar: 0.4 kg
- Levadura: 0.03 kg

**Proceso:**
1. Ir a la vista "Productos"
2. Click en "Receta" de Torta de Chocolate
3. Tipo de receta: "Por Unidad" (cada torta usa mucho ingrediente)
4. Ingresar "1" en cantidad a preparar
5. Click en "Preparar"

**Resultado:**
- Stock de Harina: 50 kg → 49.5 kg (-0.5 kg)
- Stock de Azúcar: 30 kg → 29.6 kg (-0.4 kg)
- Stock de Levadura: 10 kg → 9.97 kg (-0.03 kg)
- Stock de Torta de Chocolate: 5 → 6 (+1 unidad)

## 📊 Productos con Recetas Pre-cargadas

### Pan Francés (Tipo: Por KG)
- Harina: 0.5 kg
- Levadura: 0.02 kg
- *Se produce por kilos, ideal para producción en lotes grandes*

### Medialunas (Tipo: Por UNIDAD)
- Harina: 0.03 kg (30g)
- Azúcar: 0.01 kg (10g)
- Levadura: 0.001 kg (1g)
- *Se produce unidad por unidad, pequeñas cantidades por pieza*

### Facturas (Tipo: Por UNIDAD)
- Harina: 0.04 kg (40g)
- Azúcar: 0.015 kg (15g)
- *Se produce unidad por unidad*

### Torta de Chocolate (Tipo: Por UNIDAD)
- Harina: 0.5 kg
- Azúcar: 0.4 kg
- Levadura: 0.03 kg
- *Cada unidad (torta) usa MUCHOS ingredientes*

## ⚠️ Validaciones

- ✅ Verifica que el ingrediente exista en el stock
- ✅ Valida stock suficiente antes de preparar
- ✅ Previene preparación con stock insuficiente
- ✅ Actualiza ambos estados (stock e inventario) simultáneamente

## 🎨 Interfaz

- **Modal intuitivo** con fondo oscuro semi-transparente
- **Selector de tipo de receta** con radio buttons y descripciones claras
- **Secciones claramente divididas**: Tipo de receta, Ingredientes actuales, Agregar ingrediente, Preparar producto
- **Input adaptativo**: Acepta decimales para recetas por kg, solo enteros para recetas por unidad
- **Etiquetas dinámicas**: Muestra "kg" o "unidades" según el tipo de receta
- **Colores temáticos**: Tonos marrones coherentes con la panadería
- **Feedback visual**: Alertas informativas sobre el resultado de las operaciones

## 💡 Ventajas del Sistema

1. **Flexibilidad**: Soporta tanto producción en masa (pan) como producción unitaria (pasteles)
2. **Precisión**: Control exacto de inventario independientemente del tipo de producción
3. **Claridad**: Interface clara sobre qué tipo de receta se está usando
4. **Escalabilidad**: Fácil agregar nuevos productos de cualquier tipo
5. **Control de Stock**: Validación automática de disponibilidad de ingredientes
