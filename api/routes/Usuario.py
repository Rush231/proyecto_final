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
    contrasena_plana = datos['contrasena'] # La contraseña del usuario
    negocio_id = datos['negocio_id']


@app.route('/usuario/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtiene los datos de un usuario por su ID."""
    usuario = Usuario.get_usuario_por_id(usuario_id)
    if usuario:
        return jsonify(usuario), 200
    else:
        return jsonify({"error": "Usuario no encontrado"}), 404
    

@app.route('/login', methods=['POST'])
def login_usuario():
    auth = request.authorization
    try:
        usuario = Usuario.login(auth)
        if usuario:
            # Crear el "payload" (los datos que irán encriptados en el token)
            payload = {
                'id': usuario['id'],
                'negocio_id': usuario['negocio_id'],
                'rol': usuario['rol'],
                # El token expira en 24 horas por seguridad
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            
            # Generar el token firmado con tu clave secreta
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
            
            # Devolver los datos básicos y el token al frontend
            return jsonify({
                "id": usuario['id'],
                "username": usuario['usuario'], 
                "negocio_id": usuario['negocio_id'],
                "rol": usuario['rol'],
                "token": token
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Credenciales inválidas"}), 401