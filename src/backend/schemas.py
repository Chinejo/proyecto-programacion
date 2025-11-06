from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class TipoReceta(str, Enum):
    UNIDAD = "unidad"
    KG = "kg"

# Schemas para Stock
class StockBase(BaseModel):
    nombre: str
    cantidad: float
    unidad: str

class StockCreate(StockBase):
    pass

class StockUpdate(BaseModel):
    nombre: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None

class StockResponse(StockBase):
    id: int
    
    class Config:
        from_attributes = True

# Schemas para Ingredientes de Receta
class IngredienteRecetaBase(BaseModel):
    ingrediente: str
    cantidad: float
    unidad: str

class IngredienteRecetaCreate(IngredienteRecetaBase):
    pass

class IngredienteRecetaResponse(IngredienteRecetaBase):
    id: int
    producto_id: int
    
    class Config:
        from_attributes = True

# Schemas para Productos
class ProductoBase(BaseModel):
    nombre: str
    precio: float
    stock: float
    tipo_receta: TipoReceta = TipoReceta.UNIDAD

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[float] = None
    tipo_receta: Optional[TipoReceta] = None

class ProductoResponse(ProductoBase):
    id: int
    receta: List[IngredienteRecetaResponse] = []
    
    class Config:
        from_attributes = True

# Schemas para preparar receta
class PrepararRecetaRequest(BaseModel):
    cantidad: float = Field(..., gt=0)

# Schemas para Items de Venta
class ItemVentaBase(BaseModel):
    producto_id: int
    cantidad: int

class ItemVentaCreate(ItemVentaBase):
    pass

class ItemVentaResponse(BaseModel):
    id: int
    venta_id: int
    producto_id: int
    producto_nombre: str
    producto_precio: float
    cantidad: int
    
    class Config:
        from_attributes = True

# Schemas para Ventas
class VentaBase(BaseModel):
    items: List[ItemVentaCreate]

class VentaCreate(VentaBase):
    pass

class VentaResponse(BaseModel):
    id: int
    fecha: str
    total: float
    items: List[ItemVentaResponse] = []
    
    class Config:
        from_attributes = True
