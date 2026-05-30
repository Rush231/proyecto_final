from api.db.db_config import get_db_connection
class Negocio:
    def __init__(self, nombre, tipo, id=None):
        self.id = id
        self.nombre = nombre
        self.tipo = tipo

    def guardar(self, cursor):
        sql = "INSERT INTO Negocio (nombre, tipo) VALUES (%s, %s)"
        cursor.execute(sql, (self.nombre, self.tipo))
        self.id = cursor.lastrowid
        return self.id

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "tipo": self.tipo}
    
    @staticmethod
    def obtener_por_id(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        sql = "SELECT id, name AS nombre, tipo, telefono, hora_apertura, hora_cierre FROM Negocio WHERE id = %s"
        cursor.execute(sql, (negocio_id,))
        negocio = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        # MySQL suele devolver los campos TIME como objetos timedelta. 
        # Los convertimos a texto para que Flask pueda enviarlos como JSON.
        if negocio:
            if negocio.get('hora_apertura'):
                negocio['hora_apertura'] = str(negocio['hora_apertura'])
            if negocio.get('hora_cierre'):
                negocio['hora_cierre'] = str(negocio['hora_cierre'])
                
        return negocio

    @staticmethod
    def actualizar(negocio_id, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        sql = """UPDATE Negocio 
                 SET name = %s, telefono = %s, hora_apertura = %s, hora_cierre = %s 
                 WHERE id = %s"""
                 
        cursor.execute(sql, (
            datos.get('nombre'), 
            datos.get('telefono'), 
            datos.get('hora_apertura'), 
            datos.get('hora_cierre'), 
            negocio_id
        ))
        
        connection.commit()
        cursor.close()
        connection.close()