from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class TipoVenta(str, Enum):
    UNIDAD = "unidad"
    PESO = "peso"

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
    unidades: float = 0.0
    peso_kg: float = 0.0
    unidades_por_receta: float = 1.0
    peso_por_receta: float = 1.0

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    unidades: Optional[float] = None
    peso_kg: Optional[float] = None
    unidades_por_receta: Optional[float] = None
    peso_por_receta: Optional[float] = None

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
    cantidad: float
    tipo_venta: TipoVenta
    cantidad_peso_kg: Optional[float] = None

class ItemVentaCreate(ItemVentaBase):
    pass

class ItemVentaResponse(BaseModel):
    id: int
    venta_id: int
    producto_id: int
    producto_nombre: str
    producto_precio: float
    cantidad: float
    tipo_venta: TipoVenta
    cantidad_peso_kg: Optional[float] = None
    
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
