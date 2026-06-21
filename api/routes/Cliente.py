from api import app
from flask import jsonify, request
from api.models.Cliente import Cliente
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido



@app.route('/cliente', methods=['GET'])
@token_requerido  
def get_todos_clientes(usuario_actual): 
    try:
        negocio_id_seguro = usuario_actual['negocio_id']
        
        lista = Cliente.obtener_por_negocio(negocio_id_seguro)
        return jsonify(lista), 200
         
    except Exception as e:
         return jsonify({"error": str(e)}), 400

@app.route('/cliente', methods=['POST', 'OPTIONS'])
@token_requerido
def crear_cliente(usuario_actual):
    try:
        datos = request.json
        # Le inyectamos el ID del negocio del usuario logueado
        datos['negocio_id'] = usuario_actual['negocio_id']
        
        # Validamos usando el método de clase
        es_valido, mensaje_validacion = Cliente.validar(datos)
        if not es_valido:
            return jsonify({"error": mensaje_validacion}), 400
            
        # Llamamos al modelo para que haga el INSERT
        nuevo_id = Cliente.registrar(datos)
        
        return jsonify({"mensaje": "Cliente creado exitosamente", "id": nuevo_id}), 201
        
    except Exception as error:
        print(f"Error al registrar cliente: {str(error)}")
        return jsonify({"error": "No se pudo procesar la solicitud"}), 500

@app.route('/cliente/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_cliente(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        Cliente.eliminar(id, usuario_actual['negocio_id'])
        return jsonify({"message": "Cliente eliminado con éxito"}), 200
        
    except Exception as e:
        print(f"Error al eliminar cliente: {str(e)}")
        return jsonify({"error": "No se puede eliminar el cliente. Verifique que no tenga turnos activos."}), 500  
    
    
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