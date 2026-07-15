from api import app
from flask import jsonify, request
from api.models.Cliente import Cliente
from api.db.db_config import get_db_connection
from api.models.Usuario import Usuario
import mysql.connector
import jwt
import datetime
import re
from api.utils.seguridad import token_requerido

@app.route('/usuario', methods=['POST'])
def crear_usuario():
 
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    datos = request.json

    email = datos.get('email', '')
    password = datos.get('password', '')


    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Formato de correo inválido"}), 400



    print(f"DEBUG: Datos recibidos del frontend: {datos}")  
    try:
        # Delegamos la persistencia al Modelo de forma limpia
        if len(password) < 6:
            return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
        nuevo_id = Usuario.registrar(datos)
        return jsonify({"mensaje": "Usuario creado exitosamente", "id": nuevo_id}), 201
        
    except Exception as e:
        print(f"Error al crear usuario: {str(e)}")
        return jsonify({"error": "No se pudo crear el usuario. Revisa los datos."}), 500

@app.route('/usuario/<int:usuario_id>', methods=['GET'])
@token_requerido
def obtener_usuario(usuario_actual,usuario_id):
    if usuario_actual['id'] != usuario_id:
        return jsonify({"error": "No autorizado para acceder a este recurso"}), 403
    """Obtiene los datos de un usuario por su ID."""
    usuario = Usuario.get_usuario_por_id(usuario_id)
    if usuario:
        return jsonify(usuario), 200
    else:
        return jsonify({"error": "Usuario no encontrado"}), 404
    

@app.route('/usuario/login', methods=['POST', 'OPTIONS'])
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


@app.route('/usuario/<int:usuario_id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_usuario(usuario_actual, usuario_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    if usuario_actual['id'] != usuario_id:
        return jsonify({"error": "No autorizado para eliminar este usuario"}), 403

    try:
        eliminado = Usuario.eliminar(usuario_id)
        
        if eliminado:
            return jsonify({"mensaje": "Usuario eliminado exitosamente"}), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
    except Exception as e:
        print(f"Error al eliminar usuario: {str(e)}")
        return jsonify({"error": "No se pudo eliminar el usuario."}), 500