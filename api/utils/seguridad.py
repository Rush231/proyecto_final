from functools import wraps
from flask import request, jsonify,app
import jwt

def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = None
        
        # 1. Buscar el token en los headers (Formato: "Bearer <token>")
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Falta el token de autorización'}), 401
        
        try:
            # 2. Decodificar el token usando la clave secreta definida en __init__.py
            datos_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'El token ha expirado, inicia sesión nuevamente'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        
        # 3. Pasar los datos decodificados a la ruta original
        return f(usuario_actual=datos_token, *args, **kwargs)
    
    return decorador