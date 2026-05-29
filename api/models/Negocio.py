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