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
    """Preparar una receta (descontar ingredientes del stock y aumentar stock del producto)"""
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
    
    # Aumentar stock del producto
    producto.stock += preparar.cantidad
    
    db.commit()
    db.refresh(producto)
    return producto

# ==================== ENDPOINTS DE VENTAS ====================

@app.get("/api/ventas", response_model=List[schemas.VentaResponse], tags=["Ventas"])
def get_ventas(db: Session = Depends(get_db)):
    """Obtener todas las ventas"""
    return db.query(models.Venta).all()

@app.get("/api/ventas/{venta_id}", response_model=schemas.VentaResponse, tags=["Ventas"])
def get_venta(venta_id: int, db: Session = Depends(get_db)):
    """Obtener una venta específica"""
    venta = db.query(models.Venta).filter(models.Venta.id == venta_id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta

@app.post("/api/ventas", response_model=schemas.VentaResponse, status_code=status.HTTP_201_CREATED, tags=["Ventas"])
def create_venta(venta: schemas.VentaCreate, db: Session = Depends(get_db)):
    """Crear una nueva venta"""
    if not venta.items or len(venta.items) == 0:
        raise HTTPException(status_code=400, detail="La venta debe tener al menos un item")
    
    # Verificar stock y calcular total
    total = 0
    items_data = []
    
    for item in venta.items:
        producto = db.query(models.Producto).filter(models.Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto con id {item.producto_id} no encontrado")
        
        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"No hay suficiente stock de {producto.nombre}. Disponible: {producto.stock}, solicitado: {item.cantidad}"
            )
        
        subtotal = producto.precio * item.cantidad
        total += subtotal
        
        items_data.append({
            "producto_id": producto.id,
            "producto_nombre": producto.nombre,
            "producto_precio": producto.precio,
            "cantidad": item.cantidad
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
            **item_data
        )
        db.add(db_item)
        
        # Descontar del stock del producto
        producto = db.query(models.Producto).filter(models.Producto.id == item_data["producto_id"]).first()
        producto.stock -= item_data["cantidad"]
    
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
    
    # Crear items de stock
    stock_items = [
        models.Stock(nombre="Harina", cantidad=50, unidad="kg"),
        models.Stock(nombre="Azúcar", cantidad=30, unidad="kg"),
        models.Stock(nombre="Levadura", cantidad=10, unidad="kg"),
    ]
    
    for item in stock_items:
        db.add(item)
    
    db.commit()
    
    # Crear productos con recetas
    productos_data = [
        {
            "producto": models.Producto(nombre="Pan Francés", precio=150, stock=50, tipo_receta=models.TipoRecetaEnum.KG),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.5, "unidad": "kg"},
                {"ingrediente": "Levadura", "cantidad": 0.02, "unidad": "kg"}
            ]
        },
        {
            "producto": models.Producto(nombre="Medialunas", precio=80, stock=100, tipo_receta=models.TipoRecetaEnum.UNIDAD),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.03, "unidad": "kg"},
                {"ingrediente": "Azúcar", "cantidad": 0.01, "unidad": "kg"},
                {"ingrediente": "Levadura", "cantidad": 0.001, "unidad": "kg"}
            ]
        },
        {
            "producto": models.Producto(nombre="Facturas", precio=100, stock=75, tipo_receta=models.TipoRecetaEnum.UNIDAD),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.04, "unidad": "kg"},
                {"ingrediente": "Azúcar", "cantidad": 0.015, "unidad": "kg"}
            ]
        },
        {
            "producto": models.Producto(nombre="Torta de Chocolate", precio=500, stock=5, tipo_receta=models.TipoRecetaEnum.UNIDAD),
            "receta": [
                {"ingrediente": "Harina", "cantidad": 0.5, "unidad": "kg"},
                {"ingrediente": "Azúcar", "cantidad": 0.4, "unidad": "kg"},
                {"ingrediente": "Levadura", "cantidad": 0.03, "unidad": "kg"}
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
