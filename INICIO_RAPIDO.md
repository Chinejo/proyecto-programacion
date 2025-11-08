# 🚀 Inicio Rápido - Sistema Actualizado

## Pasos para Inicializar

### 1️⃣ Eliminar Base de Datos Actual
```powershell
Remove-Item panaderia.db -ErrorAction SilentlyContinue
```

### 2️⃣ Iniciar Backend
```powershell
python -m uvicorn src.backend.main:app --reload
```

### 3️⃣ Inicializar BD con Datos de Ejemplo
Abrir navegador en: `http://localhost:8000/docs`

Ejecutar endpoint: **POST** `/api/init-database`

Esto creará:
- ✅ 6 ingredientes en stock
- ✅ 5 productos con recetas completas

### 4️⃣ Iniciar Frontend
```powershell
npm run dev
```

### 5️⃣ Probar el Sistema
Abrir: `http://localhost:5173`

---

## 🎯 Lo Que Cambió

### Productos
- Ahora tienen **unidades** Y **peso_kg** en stock
- Cada receta define **cuántas unidades** y **cuánto peso** produce

### Preparar Receta
- Ingresas "cuántas veces preparar"
- Ejemplo: Preparar 2 veces → produce 16 unidades y 2 kg (si la receta es 8u/1kg)

### Ventas
- **Por Unidad**: Vender 2.5 unidades (permite fracciones!)
- **Por Peso**: Vender 0.8 kg
- El sistema calcula automáticamente el precio según el tipo de venta

---

## 📝 Ejemplo Completo

### Pan Francés (8 rodajas = 1 kg)
1. **Preparar 3 veces la receta**
   - Descuenta ingredientes × 3
   - Agrega: 24 rodajas (unidades) y 3 kg

2. **Vender por unidad**: 5 rodajas
   - Descuenta: 5 unidades y 0.625 kg
   - Precio: $1000 ($200 × 5)

3. **Vender por peso**: 0.8 kg
   - Descuenta: 0.8 kg y 6.4 unidades
   - Precio: $1280 ($1600 × 0.8)

---

## ✅ Todo Listo!

El sistema está completamente funcional con la nueva lógica.
