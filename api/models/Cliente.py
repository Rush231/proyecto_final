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
    