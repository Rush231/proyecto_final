from api.db.db_config import get_db_connection
class Cliente:
    esquema = {
        "nombre": str,
        "apellido": str,
        "email": str,
        "telefono": str,
        "negocio_id": int
    }
    def __init__(self, nombre, email, id=None):
        self.id = id
        self.nombre = nombre
        self.email = email

    def guardar(self, cursor):
        sql = "INSERT INTO Cliente (nombre, email) VALUES (%s, %s)"
        cursor.execute(sql, (self.nombre, self.email))
        self.id = cursor.lastrowid
        return self.id
    @staticmethod
    def obtener_por_negocio(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        sql = """
            SELECT id, name AS nombre, email AS correo, telefono 
            FROM Cliente 
            WHERE negocio_id = %s
        """ 
        cursor.execute(sql, (negocio_id,))  
        clientes = cursor.fetchall()
        cursor.close()
        connection.close()
        return clientes
    @classmethod
    def actualizar(cls, id, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        sql = """
            UPDATE Cliente 
            SET name = %s, email = %s, telefono = %s 
            WHERE id = %s AND negocio_id = %s
        """
        cursor.execute(sql, (
            datos['nombre'], 
            datos.get('correo', ''), 
            datos.get('telefono', ''), 
            id, 
            datos['negocio_id']
        ))
        
        connection.commit()
        cursor.close()
        connection.close()


    @classmethod
    def eliminar(cls, id, negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            sql = "DELETE FROM Cliente WHERE id = %s AND negocio_id = %s"
            cursor.execute(sql, (id, negocio_id))
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()
    @staticmethod
    def guardar_con_negocio(datos, negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor()
    
        sql = "INSERT INTO Cliente (name, email, telefono, negocio_id) VALUES (%s, %s, %s, %s)"
    
        
        cursor.execute(sql, (
            datos.get('nombre'), 
            datos.get('correo', ''), 
            datos.get('telefono', ''), 
            negocio_id  
        ))
    
        connection.commit()
        nuevo_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return nuevo_id
    @classmethod
    def validar(cls, datos):
        if not datos or not isinstance(datos, dict):
            return False, "Los datos proporcionados no tienen un formato válido."
        
        for campo, tipo_esperado in cls.esquema.items():
            if campo not in datos:
                return False, f"El campo obligatorio '{campo}' no está presente."
            
            if tipo_esperado == int and isinstance(datos[campo], str) and datos[campo].isdigit():
                datos[campo] = int(datos[campo])
                
            if not isinstance(datos[campo], tipo_esperado):
                return False, f"El campo '{campo}' debe ser de tipo {tipo_esperado.__name__}."
                
        return True, "Estructura verificada correctamente"