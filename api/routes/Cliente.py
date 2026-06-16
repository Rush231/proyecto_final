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
    if request.method == 'OPTIONS':
        return '', 200


    connection = None
    cursor = None
    
    try:
        datos = request.json

        if not datos or 'nombre' not in datos or 'correo' not in datos:
            return jsonify({"error": "Datos incompletos"}), 400

        # Obtener negocio_id desde el token
        negocio_id = usuario_actual.get('negocio_id')
        if not negocio_id:
            return jsonify({"error": "Error de autenticación: negocio no encontrado"}), 401

        connection = get_db_connection()
        cursor = connection.cursor()
        
        sql = "INSERT INTO Cliente (name, email, telefono, negocio_id) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (
            datos['nombre'], 
            datos['correo'], 
            datos.get('telefono', ''), 
            negocio_id
        ))
        connection.commit()
        
        return jsonify({"message": "Cliente creado exitosamente"}), 201

    except mysql.connector.Error as err:
        if connection:
            connection.rollback()
        
        if err.errno == 1062:
            return jsonify({"error": "El correo ya está registrado en este negocio"}), 409
        
        print(f"Error de base de datos: {err}")
        return jsonify({"error": "Error interno de base de datos"}), 500

    except Exception as e:
        # Manejo de errores generales
        if connection:
            connection.rollback()
        print(f"Error técnico inesperado: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

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