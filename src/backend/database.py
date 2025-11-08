from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import atexit

# Configuración de la base de datos SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./panaderia.db"

# Crear el motor de la base de datos con poolclass NullPool para SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Solo necesario para SQLite
    poolclass=None  # Deshabilitar el pool de conexiones para SQLite
)

# Crear la sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependency para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para cerrar el engine al terminar la aplicación
def close_database_connection():
    engine.dispose()

# Registrar la función de limpieza
atexit.register(close_database_connection)
