from api.db.db_config import get_db_connection
class Cliente:
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

    @staticmethod
    def guardar_con_negocio(datos, negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor()
    
        sql = "INSERT INTO Cliente (name, email, telefono, negocio_id) VALUES (%s, %s, %s, %s)"
    
        # Aquí insertamos explícitamente
        cursor.execute(sql, (
            datos.get('nombre'), 
            datos.get('correo', ''), 
            datos.get('telefono', ''), 
            negocio_id  # <--- ID del token, nunca del formulario
        ))
    
        connection.commit()
        nuevo_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return nuevo_id
