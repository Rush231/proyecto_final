class Profesional:
    schema = {
        "name": str,
        "email": str,
        "password": str,
        "negocio_id": int,
        "id": int}
    def __init__(self, nombre, email, password, negocio_id, rol='profesional', especialidad=None, id=None):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.password = password # Aquí llega la contraseña plana
        self.negocio_id = negocio_id
        self.rol = rol
        self.especialidad = especialidad


        def guardar(self, cursor):
            cursor.execute( (self.nombre, self.email, self.negocio_id, self.rol, self.especialidad))
            self.id = cursor.lastrowid
            return self.id
    
    @staticmethod
    def autenticar(cursor, email, password_ingresada):
        """Método estático para verificar login sin instanciar primero."""
        sql = "SELECT * FROM Profesional WHERE email = %s"
        cursor.execute(sql, (email,))
        data = cursor.fetchone() # Asegúrate que el cursor sea dictionary=True
        
    def validar(cls, datos):
        if datos is None or type (datos) != dict:
            return False, "Datos inválidos"
        for key in cls.schema:
            if key not in datos:
                return False, f"Falta el campo: {key}"
            if type(datos[key]) != cls.schema[key]:
                return False, f"Tipo inválido para el campo: {key}"
        return None
    
    