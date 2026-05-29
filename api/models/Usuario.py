from api.db.db_config import get_db_connection
from flask import jsonify
class Usuario:

    schema = {
        "name": str,
        "email": str,
        "password": str,
        "negocio_id": int,
        "id": int}
    def __init__(self, id, nombre, email):
        self.id = id
        self.nombre = nombre
        self.email = email
        pass
    @classmethod
    def get_usuario_por_id(cls, id):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id, nombre, email FROM Usuario WHERE id = %s", (id,))
        datos = cursor.fetchone()
        cursor.close()
        connection.close()
        if datos is not None:
            return Usuario(datos).to_json()
        

    @classmethod
    def get_todos_los_usuarios(cls):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id, nombre, email FROM Usuario")
        filas = cursor.fetchall()
        cursor.close()
        connection.close()
        usuarios = [Usuario(fila).to_json() for fila in filas]
        return usuarios
    

    @classmethod 
    def validar(cls, datos):
        if datos is None or type (datos) != dict:
            return False, "Datos inválidos"
        for key in cls.schema:
            if key not in datos:
                return False, f"Falta el campo: {key}"
            if type(datos[key]) != cls.schema[key]:
                return False, f"Tipo inválido para el campo: {key}"
        

    def __init__(self, fila):
        self.__id = fila['0']
        self.__nombre = fila['1']
        self.__email = fila['2']
        self.__password = fila['3'] 

    @classmethod 
    def post_usuario(cls, datos):
        if not cls.validar(datos):
            return jsonify({"error": "Datos inválidos"}), 400
        
        pass


    @classmethod
    def put_usuario(cls, id, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor
        if not cls.validar(datos):
           raise ValueError("Datos inválidos")
        

        #control de id

        cursor.execute("SELECT id FROM Usuario WHERE id = %s", (id,))

        #control email


        email = datos['email']
        cursor.execute("SELECT id FROM Usuario WHERE email = %s AND id != %s", (email,)) 
        fila= cursor.fetchone()
        if fila:
            raise ValueError("El email ya está en uso por otro usuario")
        

        #control dni

        dni = datos['dni']
        cursor.execute("SELECT id FROM Usuario WHERE dni = %s AND id != %s", (dni,))
        fila= cursor.fetchone()
        if fila:
            raise ValueError("El DNI ya está en uso por otro usuario")
        

    def registrar(self, cursor):
        sql = "INSERT INTO Usuario (nombre, email, contrasena) VALUES (%s, %s, %s)"
        cursor.execute(sql, (self.nombre, self.email, self.password))
        self.id = cursor.lastrowid
        return self.id

    @staticmethod
    def login(email, password_ingresada):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True) 
        
        sql = "SELECT * FROM Usuario WHERE email = %s"
        cursor.execute(sql, (email,))
        user_data = cursor.fetchone()
        
        cursor.close()
        connection.close()

        # CAMBIO CLAVE: Usamos 'password' y 'name' tal como están en tu SQL
        if user_data and user_data['password'] == password_ingresada:
            return {
                "id": user_data['id'],
                "name": user_data['name'],
                "email": user_data['email'],
                "negocio_id": user_data['negocio_id'] 
            }
        return None

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email
            # No devolvemos la contraseña aquí por un mínimo de decencia visual
        }