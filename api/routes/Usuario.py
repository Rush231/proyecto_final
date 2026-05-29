from api import app
from flask import jsonify, request
from api.models.Cliente import Cliente
from api.db.db_config import get_db_connection
from api.models.Usuario import Usuario
import mysql.connector
import jwt
import datetime

@app.route('/usuario', methods=['POST'])
def crear_usuario():
    """Crea un nuevo usuario (dueño de negocio) con contraseña hasheada."""
    datos = request.json
    
    # Datos del formulario
    nombre = datos['nombre']
    email = datos['email']
    contrasena_plana = datos['contrasena'] 
    negocio_id = datos['negocio_id']


@app.route('/usuario/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtiene los datos de un usuario por su ID."""
    usuario = Usuario.get_usuario_por_id(usuario_id)
    if usuario:
        return jsonify(usuario), 200
    else:
        return jsonify({"error": "Usuario no encontrado"}), 404
    

@app.route('/login', methods=['POST', 'OPTIONS'])
def login_usuario():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    auth = request.authorization
    print(f"INTENTO DE LOGIN")
    print(f"Email recibido: {auth.username if auth else 'NADA'}")
    print(f"Password recibido: {auth.password if auth else 'NADA'}")
   
    if not auth or not auth.username or not auth.password:
        return jsonify({"error": "Faltan credenciales"}), 401

    try:
        usuario = Usuario.login(auth.username, auth.password)
        
        if usuario:
            payload = {
                'id': usuario['id'],
                'negocio_id': usuario['negocio_id'],
                'rol': 'admin',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                "id": usuario['id'],
                "username": usuario['name'],
                "negocio_id": usuario['negocio_id'],
                "token": token
            }), 200
            
    except Exception as e:
        print(f"Error en el login: {str(e)}") 
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Credenciales inválidas"}), 401