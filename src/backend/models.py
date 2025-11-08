from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from src.backend.database import Base
import enum

class TipoVentaEnum(str, enum.Enum):
    UNIDAD = "unidad"
    PESO = "peso"

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
    
    # Stock actual
    unidades = Column(Float, nullable=False, default=0.0)  # Unidades disponibles
    peso_kg = Column(Float, nullable=False, default=0.0)  # Peso total en kg disponible
    
    # Configuración de receta (relación peso-unidad)
    unidades_por_receta = Column(Float, nullable=False, default=1.0)  # Unidades que produce la receta
    peso_por_receta = Column(Float, nullable=False, default=1.0)  # Peso total en kg que produce la receta
    
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
    cantidad = Column(Float, nullable=False)  # Cantidad vendida (puede ser fracción)
    tipo_venta = Column(Enum(TipoVentaEnum), nullable=False)  # Si se vendió por unidad o peso
    cantidad_peso_kg = Column(Float, nullable=True)  # Peso vendido si tipo_venta es PESO
    
    # Relaciones
    venta = relationship("Venta", back_populates="items")
    producto = relationship("Producto", back_populates="items_venta")
