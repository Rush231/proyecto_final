from api import app
from flask import jsonify, request
from api.models.Cliente import Cliente
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido


# Quitamos el <int:negocio_id> de la ruta, ya no es necesario pasarlo por URL
@app.route('/clientes', methods=['GET'])
@token_requerido  # Protegemos la ruta
def get_todos_clientes(usuario_actual): # Recibimos los datos del token
    try:
        # Extraemos el negocio_id de manera 100% segura desde el token
        negocio_id_seguro = usuario_actual['negocio_id']
        
        lista = Cliente.obtener_por_negocio(negocio_id_seguro)
        return jsonify(lista), 200
         
    except Exception as e:
         return jsonify({"error": str(e)}), 400

@app.route('/crear', methods=['POST'])
@token_requerido
def crear_cliente(usuario_actual):
    datos = request.json
    
    # Inyectamos el negocio_id seguro antes de guardar en la BD
    datos['negocio_id'] = usuario_actual['negocio_id']
    
    es_valido, mensaje = Cliente.validar(datos)
    if not es_valido:
        return jsonify({"error": mensaje}), 400
    
    try:
        exito, resultado = Cliente.crear(datos)
        if exito:
            return jsonify(resultado), 201
        else:
            return jsonify({"error": resultado}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500