from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.backend.database import Base
import enum

class TipoRecetaEnum(str, enum.Enum):
    UNIDAD = "unidad"
    KG = "kg"

class Stock(Base):
    __tablename__ = "stock"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)

class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    precio = Column(Float, nullable=False)
    stock = Column(Float, nullable=False)
    tipo_receta = Column(Enum(TipoRecetaEnum), default=TipoRecetaEnum.UNIDAD, nullable=False)
    
    # Relaciones
    receta = relationship("IngredienteReceta", back_populates="producto", cascade="all, delete-orphan")
    items_venta = relationship("ItemVenta", back_populates="producto")

class IngredienteReceta(Base):
    __tablename__ = "ingredientes_receta"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    ingrediente = Column(String, nullable=False)  # Nombre del ingrediente del stock
    cantidad = Column(Float, nullable=False)
    unidad = Column(String, nullable=False)
    
    # Relaciones
    producto = relationship("Producto", back_populates="receta")

class Venta(Base):
    __tablename__ = "ventas"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(String, nullable=False)  # Formato: ISO string
    total = Column(Float, nullable=False)
    
    # Relaciones
    items = relationship("ItemVenta", back_populates="venta", cascade="all, delete-orphan")

class ItemVenta(Base):
    __tablename__ = "items_venta"
    
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    producto_nombre = Column(String, nullable=False)  # Para mantener historial
    producto_precio = Column(Float, nullable=False)  # Precio al momento de la venta
    cantidad = Column(Integer, nullable=False)
    
    # Relaciones
    venta = relationship("Venta", back_populates="items")
    producto = relationship("Producto", back_populates="items_venta")
