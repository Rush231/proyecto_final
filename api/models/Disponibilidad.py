from api.db.db_config import get_db_connection

class Disponibilidad:
    def __init__(self, profesional_id, dia_semana, hora_inicio, hora_fin, id=None):
        self.id = id
        self.profesional_id = profesional_id
        self.dia_semana = dia_semana
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin

    def guardar(self, cursor):
        sql = "INSERT INTO Disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (self.profesional_id, self.dia_semana, self.hora_inicio, self.hora_fin))
        self.id = cursor.lastrowid
        return self.id

    @staticmethod
    def get_hay_disponibilidad():
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        sql = "SELECT id, profesional_id, dia_semana, hora_inicio, hora_fin FROM Disponibilidad"
        cursor.execute(sql)
        disponibilidades = cursor.fetchall()
        
        # Formateamos los objetos timedelta/time a string para evitar errores al pasar a JSON
        for d in disponibilidades:
            if d['hora_inicio']:
                d['hora_inicio'] = str(d['hora_inicio'])
            if d['hora_fin']:
                d['hora_fin'] = str(d['hora_fin'])
                
        cursor.close()
        connection.close()
        return disponibilidades