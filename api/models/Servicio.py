from api.db.db_config import get_db_connection
class Servicio:
    esquema = {
        "nombre": str,
        "duracion": int,
        "negocio_id": int
    }
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
    

    @staticmethod
    def obtener_por_negocio(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
    
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
    def actualizar(cls, id, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            sql = "UPDATE Servicio SET name = %s, duracion = %s WHERE id = %s AND negocio_id = %s"
            cursor.execute(sql, (datos['nombre'], datos['duracion'], id, datos['negocio_id']))
            connection.commit()
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
    @classmethod
    def validar(cls, datos):
        if not datos or not isinstance(datos, dict):
            return False, "Datos inválidos: Se esperaba un objeto JSON."
        
        for campo, tipo_esperado in cls.esquema.items():
            if campo not in datos:
                return False, f"Falta el campo requerido: {campo}"
            if not isinstance(datos[campo], tipo_esperado):
                return False, f"Tipo de dato incorrecto para {campo}: se esperaba {tipo_esperado.__name__}"