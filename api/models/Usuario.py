from multiprocessing import connection

from api.db.db_config import get_db_connection
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario:

    schema = {
        "name": str,
        "email": str,
        "password": str,
        "negocio_id": int,
        "id": int}
    def __init__(self, fila):
        self.id = fila[0]
        self.nombre = fila[1]
        self.email = fila[2]
        pass

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email
        }
    
    @classmethod
    def get_usuario_por_id(cls, id):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id, name, email FROM Usuario WHERE id = %s", (id,))
        datos = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if datos is not None:
            usuario_diccionario = Usuario(datos).to_dict()
            print("DEBUG - Diccionario listo para enviar:", usuario_diccionario) 
        return usuario_diccionario

    @classmethod
    def get_todos_los_usuarios(cls):
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id, name, email FROM Usuario")
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
        

     

        cursor.execute("SELECT id FROM Usuario WHERE id = %s", (id,))

      


        email = datos['email']
        cursor.execute("SELECT id FROM Usuario WHERE email = %s AND id != %s", (email,)) 
        fila= cursor.fetchone()
        if fila:
            raise ValueError("El email ya está en uso por otro usuario")
        

        

        dni = datos['dni']
        cursor.execute("SELECT id FROM Usuario WHERE dni = %s AND id != %s", (dni,))
        fila= cursor.fetchone()
        if fila:
            raise ValueError("El DNI ya está en uso por otro usuario")
        

    def registrar(self, cursor):
        sql = "INSERT INTO Usuario (name, email, password) VALUES (%s, %s, %s)"
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

        
        if user_data and check_password_hash(user_data['password'], password_ingresada):
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

        }
    @classmethod
    def registrar(cls, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            nombre = datos['name']
            email = datos['email']
            password = datos['password']
            negocio_id = datos.get('negocio_id', None)
            password_hash = generate_password_hash(datos['password'])
            sql_negocio = "INSERT INTO Negocio (name, tipo) VALUES (%s, %s)"
            cursor.execute(sql_negocio, (datos['nombre_de_negocio'], 'General'))
            negocio_id = cursor.lastrowid
    
    #  Crear el usuario asociándolo a ese negocio
            sql_usuario = "INSERT INTO Usuario (name, email, password, negocio_id) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql_usuario, (datos['name'], datos['email'], password_hash, negocio_id))
            
            
            connection.commit()
            return cursor.lastrowid
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()