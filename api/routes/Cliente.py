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

@app.route('/cliente', methods=['POST', 'OPTIONS'])
@token_requerido
def crear_cliente(usuario_actual):
    # 1. Autorizar la solicitud de seguridad del navegador (CORS Preflight)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    datos = request.json
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # 2. Insertar directamente usando las columnas correctas de tu base de datos
        sql = """
            INSERT INTO Cliente (name, email, telefono, negocio_id) 
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (
            datos['nombre'], 
            datos.get('correo', ''), 
            datos.get('telefono', ''), 
            usuario_actual['negocio_id']
        ))
        
        connection.commit()
        nuevo_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Cliente creado exitosamente", "id": nuevo_id}), 201
        
    except Exception as e:
        print(f"Error al crear cliente: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
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