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