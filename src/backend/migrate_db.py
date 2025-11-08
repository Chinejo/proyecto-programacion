"""
Script de migración de base de datos
Migra de la estructura antigua (con tipo_receta y stock) a la nueva estructura
(con unidades, peso_kg, unidades_por_receta, peso_por_receta)
"""
import sqlite3
import os

DB_PATH = "./panaderia.db"

def migrate_database():
    """Migrar la base de datos a la nueva estructura"""
    
    if not os.path.exists(DB_PATH):
        print(f"No se encontró la base de datos en {DB_PATH}")
        print("No es necesaria la migración. La base de datos se creará con la nueva estructura.")
        return
    
    print(f"Iniciando migración de {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar si ya se migró (chequeando si existe la columna 'unidades')
        cursor.execute("PRAGMA table_info(productos)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'unidades' in columns:
            print("La base de datos ya está migrada.")
            conn.close()
            return
        
        print("Creando backup de la tabla productos...")
        cursor.execute("""
            CREATE TABLE productos_backup AS 
            SELECT * FROM productos
        """)
        
        print("Eliminando tabla productos...")
        cursor.execute("DROP TABLE productos")
        
        print("Creando nueva tabla productos...")
        cursor.execute("""
            CREATE TABLE productos (
                id INTEGER NOT NULL PRIMARY KEY,
                nombre VARCHAR NOT NULL,
                precio FLOAT NOT NULL,
                unidades FLOAT NOT NULL DEFAULT 0.0,
                peso_kg FLOAT NOT NULL DEFAULT 0.0,
                unidades_por_receta FLOAT NOT NULL DEFAULT 1.0,
                peso_por_receta FLOAT NOT NULL DEFAULT 1.0
            )
        """)
        
        print("Migrando datos de productos...")
        # Migrar datos con valores por defecto razonables
        cursor.execute("""
            INSERT INTO productos (id, nombre, precio, unidades, peso_kg, unidades_por_receta, peso_por_receta)
            SELECT 
                id, 
                nombre, 
                precio,
                stock,  -- Las unidades iniciales serán el stock antiguo
                CASE 
                    WHEN tipo_receta = 'kg' THEN stock  -- Si era por kg, el peso es el stock
                    ELSE stock * 0.05  -- Si era por unidad, asumimos 50g por unidad
                END as peso_kg,
                CASE 
                    WHEN tipo_receta = 'kg' THEN 8.0  -- Asumir 8 unidades por kg
                    ELSE 1.0  -- 1 unidad por receta
                END as unidades_por_receta,
                CASE 
                    WHEN tipo_receta = 'kg' THEN 1.0  -- 1 kg por receta
                    ELSE 0.05  -- 50g por receta de unidad
                END as peso_por_receta
            FROM productos_backup
        """)
        
        print("Actualizando tabla items_venta...")
        # Verificar si la tabla items_venta necesita migración
        cursor.execute("PRAGMA table_info(items_venta)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'tipo_venta' not in columns:
            print("Creando backup de items_venta...")
            cursor.execute("""
                CREATE TABLE items_venta_backup AS 
                SELECT * FROM items_venta
            """)
            
            print("Eliminando tabla items_venta...")
            cursor.execute("DROP TABLE items_venta")
            
            print("Creando nueva tabla items_venta...")
            cursor.execute("""
                CREATE TABLE items_venta (
                    id INTEGER NOT NULL PRIMARY KEY,
                    venta_id INTEGER NOT NULL,
                    producto_id INTEGER NOT NULL,
                    producto_nombre VARCHAR NOT NULL,
                    producto_precio FLOAT NOT NULL,
                    cantidad FLOAT NOT NULL,
                    tipo_venta VARCHAR NOT NULL DEFAULT 'unidad',
                    cantidad_peso_kg FLOAT,
                    FOREIGN KEY(venta_id) REFERENCES ventas (id),
                    FOREIGN KEY(producto_id) REFERENCES productos (id)
                )
            """)
            
            print("Migrando datos de items_venta...")
            cursor.execute("""
                INSERT INTO items_venta (id, venta_id, producto_id, producto_nombre, producto_precio, cantidad, tipo_venta, cantidad_peso_kg)
                SELECT 
                    id, 
                    venta_id, 
                    producto_id, 
                    producto_nombre, 
                    producto_precio,
                    CAST(cantidad AS FLOAT),  -- Convertir a FLOAT
                    'unidad',  -- Por defecto, las ventas antiguas son por unidad
                    NULL  -- No hay información de peso en ventas antiguas
                FROM items_venta_backup
            """)
            
            print("Eliminando backup de items_venta...")
            cursor.execute("DROP TABLE items_venta_backup")
        
        print("Eliminando backup de productos...")
        cursor.execute("DROP TABLE productos_backup")
        
        conn.commit()
        print("✓ Migración completada exitosamente!")
        
        # Mostrar resumen
        cursor.execute("SELECT COUNT(*) FROM productos")
        count = cursor.fetchone()[0]
        print(f"  - {count} productos migrados")
        
        cursor.execute("SELECT COUNT(*) FROM items_venta")
        count = cursor.fetchone()[0]
        print(f"  - {count} items de venta migrados")
        
    except Exception as e:
        print(f"✗ Error durante la migración: {e}")
        conn.rollback()
        print("Revertiendo cambios...")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
