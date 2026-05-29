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
        # Traemos todos los clientes temporalmente porque no hay negocio_id en la BD
        sql = "SELECT id, name AS nombre FROM Cliente" 
        cursor.execute(sql)
        clientes = cursor.fetchall()
        cursor.close()
        connection.close()
        return clientes