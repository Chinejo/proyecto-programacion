from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from src.backend import models
from src.backend import schemas
from src.backend.database import engine, get_db

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Panadería API",
    description="API RESTful para gestión de panadería con stock, productos, recetas y ventas",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENDPOINTS DE STOCK ====================

@app.get("/api/stock", response_model=List[schemas.StockResponse], tags=["Stock"])
def get_stock(db: Session = Depends(get_db)):
    """Obtener todos los items del stock"""
    return db.query(models.Stock).all()

@app.get("/api/stock/{stock_id}", response_model=schemas.StockResponse, tags=["Stock"])
def get_stock_item(stock_id: int, db: Session = Depends(get_db)):
    """Obtener un item específico del stock"""
    stock_item = db.query(models.Stock).filter(models.Stock.id == stock_id).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail="Item de stock no encontrado")
    return stock_item

@app.post("/api/stock", response_model=schemas.StockResponse, status_code=status.HTTP_201_CREATED, tags=["Stock"])
def create_stock(stock: schemas.StockCreate, db: Session = Depends(get_db)):
    """Crear un nuevo item de stock"""
    # Verificar si ya existe un item con ese nombre
    existing = db.query(models.Stock).filter(models.Stock.nombre == stock.nombre).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un item con ese nombre")
    
    db_stock = models.Stock(**stock.model_dump())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock

@app.put("/api/stock/{stock_id}", response_model=schemas.StockResponse, tags=["Stock"])
def update_stock(stock_id: int, stock: schemas.StockUpdate, db: Session = Depends(get_db)):
    """Actualizar un item del stock"""
    db_stock = db.query(models.Stock).filter(models.Stock.id == stock_id).first()
    if not db_stock:
        raise HTTPException(status_code=404, detail="Item de stock no encontrado")
    
    update_data = stock.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_stock, key, value)
    
    db.commit()
    db.refresh(db_stock)
    return db_stock

@app.delete("/api/stock/{stock_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Stock"])
def delete_stock(stock_id: int, db: Session = Depends(get_db)):
    """Eliminar un item del stock"""
    db_stock = db.query(models.Stock).filter(models.Stock.id == stock_id).first()
    if not db_stock:
        raise HTTPException(status_code=404, detail="Item de stock no encontrado")
    
    db.delete(db_stock)
    db.commit()
    return None

# ==================== ENDPOINTS DE PRODUCTOS ====================

@app.get("/api/productos", response_model=List[schemas.ProductoResponse], tags=["Productos"])
def get_productos(db: Session = Depends(get_db)):
    """Obtener todos los productos"""
    return db.query(models.Producto).all()

@app.get("/api/productos/{producto_id}", response_model=schemas.ProductoResponse, tags=["Productos"])
def get_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener un producto específico"""
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@app.post("/api/productos", response_model=schemas.ProductoResponse, status_code=status.HTTP_201_CREATED, tags=["Productos"])
def create_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo producto"""
    db_producto = models.Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

@app.put("/api/productos/{producto_id}", response_model=schemas.ProductoResponse, tags=["Productos"])
def update_producto(producto_id: int, producto: schemas.ProductoUpdate, db: Session = Depends(get_db)):
    """Actualizar un producto"""
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    update_data = producto.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_producto, key, value)
    
    db.commit()
    db.refresh(db_producto)
    return db_producto

@app.delete("/api/productos/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Productos"])
def delete_producto(producto_id: int, db: Session = Depends(get_db)):
    """Eliminar un producto"""
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(db_producto)
    db.commit()
    return None

# ==================== ENDPOINTS DE RECETAS ====================

@app.post("/api/productos/{producto_id}/receta", response_model=schemas.IngredienteRecetaResponse, status_code=status.HTTP_201_CREATED, tags=["Recetas"])
def add_ingrediente_receta(producto_id: int, ingrediente: schemas.IngredienteRecetaCreate, db: Session = Depends(get_db)):
    """Agregar un ingrediente a la receta de un producto"""
    # Verificar que el producto existe
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Verificar que el ingrediente existe en el stock
    stock_item = db.query(models.Stock).filter(models.Stock.nombre == ingrediente.ingrediente).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail=f"El ingrediente '{ingrediente.ingrediente}' no existe en el stock")
    
    # Crear el ingrediente de la receta
    db_ingrediente = models.IngredienteReceta(
        producto_id=producto_id,
        **ingrediente.model_dump()
    )
    db.add(db_ingrediente)
    db.commit()
    db.refresh(db_ingrediente)
    return db_ingrediente

@app.delete("/api/productos/{producto_id}/receta/{ingrediente_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Recetas"])
def delete_ingrediente_receta(producto_id: int, ingrediente_id: int, db: Session = Depends(get_db)):
    """Eliminar un ingrediente de la receta de un producto"""
    ingrediente = db.query(models.IngredienteReceta).filter(
        models.IngredienteReceta.id == ingrediente_id,
        models.IngredienteReceta.producto_id == producto_id
    ).first()
    
    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente de receta no encontrado")
    
    db.delete(ingrediente)
    db.commit()
    return None

@app.post("/api/productos/{producto_id}/preparar", response_model=schemas.ProductoResponse, tags=["Recetas"])
def preparar_receta(producto_id: int, preparar: schemas.PrepararRecetaRequest, db: Session = Depends(get_db)):
    """Preparar una receta (descontar ingredientes del stock y aumentar stock del producto)
    
    Al preparar una receta, se producen exactamente las unidades y el peso definidos en la receta,
    multiplicados por la cantidad de veces que se prepara.
    """
    # Obtener el producto
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Verificar que tiene receta
    if not producto.receta or len(producto.receta) == 0:
        raise HTTPException(status_code=400, detail="Este producto no tiene receta definida")
    
    # Verificar stock suficiente de todos los ingredientes
    for ingrediente in producto.receta:
        stock_item = db.query(models.Stock).filter(models.Stock.nombre == ingrediente.ingrediente).first()
        if not stock_item:
            raise HTTPException(status_code=404, detail=f"El ingrediente '{ingrediente.ingrediente}' no existe en el stock")
        
        cantidad_necesaria = ingrediente.cantidad * preparar.cantidad
        if stock_item.cantidad < cantidad_necesaria:
            raise HTTPException(
                status_code=400, 
                detail=f"No hay suficiente {ingrediente.ingrediente}. Necesitas {cantidad_necesaria} {ingrediente.unidad} pero solo hay {stock_item.cantidad} {stock_item.unidad}"
            )
    
    # Descontar ingredientes del stock
    for ingrediente in producto.receta:
        stock_item = db.query(models.Stock).filter(models.Stock.nombre == ingrediente.ingrediente).first()
        cantidad_a_descontar = ingrediente.cantidad * preparar.cantidad
        stock_item.cantidad -= cantidad_a_descontar
    
    # Aumentar stock del producto (unidades y peso según la receta)
    unidades_producidas = producto.unidades_por_receta * preparar.cantidad
    peso_producido = producto.peso_por_receta * preparar.cantidad
    
    producto.unidades += unidades_producidas
    producto.peso_kg += peso_producido
    
    db.commit()
    db.refresh(producto)
    return producto

# ==================== ENDPOINTS DE VENTAS ====================

@app.get("/api/ventas", response_model=List[schemas.VentaResponse], tags=["Ventas"])
def get_ventas(db: Session = Depends(get_db)):
    """Obtener todas las ventas"""
    return db.query(models.Venta).order_by(models.Venta.id.desc()).all()

@app.get("/api/ventas/{venta_id}", response_model=schemas.VentaResponse, tags=["Ventas"])
def get_venta(venta_id: int, db: Session = Depends(get_db)):
    """Obtener una venta específica"""
    venta = db.query(models.Venta).filter(models.Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta

@app.post("/api/ventas", response_model=schemas.VentaResponse, status_code=status.HTTP_201_CREATED, tags=["Ventas"])
def create_venta(venta: schemas.VentaCreate, db: Session = Depends(get_db)):
    """Crear una nueva venta
    
    Soporta venta por unidad o por peso. La relación peso-unidad se calcula desde la receta.
    - Venta por UNIDAD: descuenta unidades y calcula peso proporcional
    - Venta por PESO: descuenta peso y calcula unidades proporcionales
    """
    if not venta.items or len(venta.items) == 0:
        raise HTTPException(status_code=400, detail="La venta debe tener al menos un item")
    
    # Verificar stock y calcular total
    total = 0
    items_data = []
    
    for item in venta.items:
        producto = db.query(models.Producto).filter(models.Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto con id {item.producto_id} no encontrado")
        
        # Calcular kg por unidad desde la receta
        kg_por_unidad = producto.peso_por_receta / producto.unidades_por_receta if producto.unidades_por_receta > 0 else 0
        
        # Determinar qué se vende y calcular descuentos
        if item.tipo_venta == schemas.TipoVenta.UNIDAD:
            # Venta por unidad
            unidades_a_descontar = item.cantidad
            peso_a_descontar = item.cantidad * kg_por_unidad
            
            # Verificar stock de unidades
            if producto.unidades < unidades_a_descontar:
                raise HTTPException(
                    status_code=400,
                    detail=f"No hay suficiente stock de {producto.nombre}. Disponible: {producto.unidades} unidades, solicitado: {unidades_a_descontar}"
                )
            
            # Calcular precio (por unidad)
            precio_unitario = producto.precio
            subtotal = precio_unitario * item.cantidad
            
        else:  # PESO
            # Venta por peso (kg)
            peso_a_descontar = item.cantidad_peso_kg if item.cantidad_peso_kg else item.cantidad
            unidades_a_descontar = peso_a_descontar / kg_por_unidad if kg_por_unidad > 0 else 0
            
            # Verificar stock de peso
            if producto.peso_kg < peso_a_descontar:
                raise HTTPException(
                    status_code=400,
                    detail=f"No hay suficiente stock de {producto.nombre}. Disponible: {producto.peso_kg} kg, solicitado: {peso_a_descontar} kg"
                )
            
            # Calcular precio proporcional al peso
            precio_por_kg = producto.precio / kg_por_unidad if kg_por_unidad > 0 else producto.precio
            subtotal = precio_por_kg * peso_a_descontar
        
        total += subtotal
        
        items_data.append({
            "producto": producto,
            "producto_id": producto.id,
            "producto_nombre": producto.nombre,
            "producto_precio": producto.precio,
            "cantidad": item.cantidad,
            "tipo_venta": item.tipo_venta,
            "cantidad_peso_kg": item.cantidad_peso_kg,
            "unidades_a_descontar": unidades_a_descontar,
            "peso_a_descontar": peso_a_descontar
        })
    
    # Crear la venta
    db_venta = models.Venta(
        fecha=datetime.now().isoformat(),
        total=total
    )
    db.add(db_venta)
    db.flush()  # Para obtener el ID de la venta
    
    # Crear los items de venta y descontar stock
    for item_data in items_data:
        db_item = models.ItemVenta(
            venta_id=db_venta.id,
            producto_id=item_data["producto_id"],
            producto_nombre=item_data["producto_nombre"],
            producto_precio=item_data["producto_precio"],
            cantidad=item_data["cantidad"],
            tipo_venta=item_data["tipo_venta"],
            cantidad_peso_kg=item_data["cantidad_peso_kg"]
        )
        db.add(db_item)
        
        # Descontar del stock del producto (unidades y peso)
        producto = item_data["producto"]
        producto.unidades -= item_data["unidades_a_descontar"]
        producto.peso_kg -= item_data["peso_a_descontar"]
    
    db.commit()
    db.refresh(db_venta)
    return db_venta

# ==================== ENDPOINT DE INICIALIZACIÓN ====================

@app.post("/api/init-database", tags=["Admin"])
def init_database(db: Session = Depends(get_db)):
    """Inicializar la base de datos con datos de ejemplo (solo si está vacía)"""
    # Verificar si ya hay datos
    if db.query(models.Stock).count() > 0:
        raise HTTPException(status_code=400, detail="La base de datos ya tiene datos")
    
    # Crear items de stock con cantidades suficientes para pruebas
    stock_items = [
        models.Stock(nombre="Harina", cantidad=500, unidad="kg"),  # Suficiente para ~1000 panes o 20000 medialunas
        models.Stock(nombre="Azúcar", cantidad=300, unidad="kg"),  # Suficiente para ~20000 medialunas o 750 tortas
        models.Stock(nombre="Levadura", cantidad=50, unidad="kg"),  # Suficiente para ~2500 panes o 50000 medialunas
        models.Stock(nombre="Manteca", cantidad=100, unidad="kg"), # Ingrediente adicional para pruebas
        models.Stock(nombre="Leche", cantidad=200, unidad="L"),    # Ingrediente adicional para pruebas
        models.Stock(nombre="Agua", cantidad=1000, unidad="L"),    # Ingrediente adicional para pruebas
    ]
    
    for item in stock_items:
        db.add(item)
    
    db.commit()
    
    # Crear productos con recetas
    # Formato: nombre, precio, stock inicial (unidades), stock inicial (kg), unidades_por_receta, peso_por_receta
    productos_data = [
        {
            "producto": models.Producto(
                nombre="Pan Francés", 
                precio=1600,  # Precio por kg
                unidades=50,  # 50 panes en stock
                peso_kg=6.25,  # 6.25 kg en stock
                unidades_por_receta=8,  # 1 receta produce 8 panes
                peso_por_receta=1.0  # 1 receta produce 1 kg total
            ),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.5, "unidad": "kg"},
                {"ingrediente": "Levadura", "cantidad": 0.02, "unidad": "kg"},
                {"ingrediente": "Agua", "cantidad": 0.3, "unidad": "L"}
            ]
        },
        {
            "producto": models.Producto(
                nombre="Medialunas", 
                precio=80,  # Precio por unidad
                unidades=100,  # 100 medialunas en stock
                peso_kg=2.0,  # 2 kg en stock
                unidades_por_receta=12,  # 1 receta produce 12 medialunas
                peso_por_receta=0.24  # 1 receta produce 0.24 kg total (20g cada una)
            ),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.15, "unidad": "kg"},
                {"ingrediente": "Azúcar", "cantidad": 0.05, "unidad": "kg"},
                {"ingrediente": "Levadura", "cantidad": 0.01, "unidad": "kg"},
                {"ingrediente": "Manteca", "cantidad": 0.03, "unidad": "kg"}
            ]
        },
        {
            "producto": models.Producto(
                nombre="Facturas", 
                precio=100,  # Precio por unidad
                unidades=75,  # 75 facturas en stock
                peso_kg=2.25,  # 2.25 kg en stock
                unidades_por_receta=10,  # 1 receta produce 10 facturas
                peso_por_receta=0.3  # 1 receta produce 0.3 kg total (30g cada una)
            ),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.18, "unidad": "kg"},
                {"ingrediente": "Azúcar", "cantidad": 0.06, "unidad": "kg"},
                {"ingrediente": "Manteca", "cantidad": 0.04, "unidad": "kg"},
                {"ingrediente": "Leche", "cantidad": 0.05, "unidad": "L"}
            ]
        },
        {
            "producto": models.Producto(
                nombre="Torta de Chocolate", 
                precio=5000,  # Precio por unidad (torta entera)
                unidades=5,  # 5 tortas en stock
                peso_kg=7.5,  # 7.5 kg en stock
                unidades_por_receta=1,  # 1 receta produce 1 torta
                peso_por_receta=1.5  # 1 receta produce 1.5 kg
            ),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.5, "unidad": "kg"},
                {"ingrediente": "Azúcar", "cantidad": 0.4, "unidad": "kg"},
                {"ingrediente": "Levadura", "cantidad": 0.03, "unidad": "kg"},
                {"ingrediente": "Manteca", "cantidad": 0.2, "unidad": "kg"}
            ]
        },
        {
            "producto": models.Producto(
                nombre="Croissants", 
                precio=120,  # Precio por unidad
                unidades=30,  # 30 croissants en stock
                peso_kg=2.1,  # 2.1 kg en stock
                unidades_por_receta=6,  # 1 receta produce 6 croissants
                peso_por_receta=0.42  # 1 receta produce 0.42 kg total (70g cada uno)
            ),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.25, "unidad": "kg"},
                {"ingrediente": "Manteca", "cantidad": 0.1, "unidad": "kg"},
                {"ingrediente": "Leche", "cantidad": 0.05, "unidad": "L"},
                {"ingrediente": "Levadura", "cantidad": 0.01, "unidad": "kg"}
            ]
        }
    ]
    
    for item in productos_data:
        db.add(item["producto"])
        db.flush()
        
        for ing_data in item["receta"]:
            ingrediente = models.IngredienteReceta(
                producto_id=item["producto"].id,
                **ing_data
            )
            db.add(ingrediente)
    
    db.commit()
    
    return {"message": "Base de datos inicializada correctamente"}

@app.get("/", tags=["Root"])
def root():
    """Endpoint raíz"""
    return {
        "message": "API de Panadería",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }
