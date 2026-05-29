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