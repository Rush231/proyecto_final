from api import app
from flask import jsonify, request
from api.models.Cliente import Cliente
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido



@app.route('/clientes', methods=['GET'])
@token_requerido  
def get_todos_clientes(usuario_actual): 
    try:
        negocio_id_seguro = usuario_actual['negocio_id']
        
        lista = Cliente.obtener_por_negocio(negocio_id_seguro)
        return jsonify(lista), 200
         
    except Exception as e:
         return jsonify({"error": str(e)}), 400

@app.route('/crear', methods=['POST'])
@token_requerido
def crear_cliente(usuario_actual):
    datos = request.json
    
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

@app.route('/eliminar/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_cliente(usuario_actual, id):

    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        sql = "DELETE FROM Cliente WHERE id = %s AND negocio_id = %s"
        cursor.execute(sql, (id, usuario_actual['negocio_id']))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Cliente eliminado con éxito"}), 200
        
    except Exception as e:

        print(f"Error interno al eliminar cliente: {str(e)}")
        return jsonify({"error": "No se puede eliminar el cliente porque tiene turnos asignados u otro error interno."}), 500
    
    
@app.route('/cliente/<int:id>', methods=['PUT', 'OPTIONS'])
@token_requerido
def actualizar_cliente(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        datos = request.json
        datos['negocio_id'] = usuario_actual['negocio_id'] # Por seguridad
        
        Cliente.actualizar(id, datos)
        return jsonify({"message": "Cliente actualizado exitosamente"}), 200
        
    except Exception as e:
        print(f"Error al actualizar cliente: {str(e)}")
        return jsonify({"error": str(e)}), 500