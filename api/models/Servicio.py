from api.db.db_config import get_db_connection
class Servicio:
    def __init__(self, nombre, duracion, negocio_id, id=None):
        self.id = id
        self.nombre = nombre
        self.duracion = duracion
        self.negocio_id = negocio_id

    def guardar(self, cursor):
        sql = "INSERT INTO Servicio (nombre, duracion, negocio_id) VALUES (%s, %s, %s)"
        cursor.execute(sql, (self.nombre, self.duracion, self.negocio_id))
        self.id = cursor.lastrowid
        return self.id
    

    from api.db.db_config import get_db_connection

class Servicio:
    def __init__(self, nombre, duracion, negocio_id, id=None):
        # ... tu código actual ...
        pass

    def guardar(self, cursor):
        # ... tu código actual ...
        pass

    # --- NUEVA FUNCIÓN A AGREGAR ---
    @staticmethod
    def obtener_por_negocio(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # CORRECCIÓN: Cambiamos 'nombre' por 'name AS nombre'
        sql = "SELECT id, name AS nombre, duracion FROM Servicio WHERE negocio_id = %s"
        
        cursor.execute(sql, (negocio_id,))
        servicios = cursor.fetchall()
        cursor.close()
        connection.close()
        return servicios
    @staticmethod
    def obtener_por_profesional(profesional_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Hacemos un JOIN con la tabla puente para filtrar por el profesional exacto
        sql = """
            SELECT s.id, s.name AS nombre, s.duracion 
            FROM Servicio s
            JOIN Profesional_Servicio ps ON s.id = ps.servicio_id
            WHERE ps.profesional_id = %s
        """
        cursor.execute(sql, (profesional_id,))
        servicios = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return servicios