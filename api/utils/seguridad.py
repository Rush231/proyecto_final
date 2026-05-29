from functools import wraps
from flask import request, jsonify
from api import app
import jwt

def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'error': 'Token no encontrado'}), 401

        try:
            # Decodificamos el token
            datos_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            usuario_actual = datos_token
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'El token ha expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401

        return f(usuario_actual, *args, **kwargs)
    return decorador