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
    @classmethod
    def registrar(cls, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            sql = "INSERT INTO Servicio (name, duracion, negocio_id) VALUES (%s, %s, %s)"
            cursor.execute(sql, (datos['nombre'], datos['duracion'], datos['negocio_id']))
            nuevo_id = cursor.lastrowid
            connection.commit()
            return nuevo_id
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()

    @classmethod
    def eliminar(cls, id, negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            cursor.execute("DELETE FROM Profesional_Servicio WHERE servicio_id = %s", (id,))
            
            sql = "DELETE FROM Servicio WHERE id = %s AND negocio_id = %s"
            cursor.execute(sql, (id, negocio_id))
            
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()