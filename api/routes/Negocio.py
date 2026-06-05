from api import app
from flask import jsonify, request
from api.models.Negocio import Negocio
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido

@app.route('/negocio', methods=['POST'])
def crear_negocio():
    datos = request.json
    sql = "INSERT INTO Negocio (nombre, tipo) VALUES (%s, %s)"
    
    conn = get_db_connection()

    try:
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500
        
        cursor = conn.cursor()
        cursor.execute(sql, (datos['nombre'], datos['tipo']))
        conn.commit()
        return jsonify({"mensaje": "Negocio creado", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()


@app.route('/negocio', methods=['GET'])
def get_todos_negocios():
    try:
         lista = Negocio.get_todos_negocios()
         return jsonify(lista), 200
    except Exception as e:
         return jsonify({"error": str(e)}), 400
    


from api.utils.seguridad import token_requerido

@app.route('/negocio/configuracion', methods=['GET'])
@token_requerido
def obtener_configuracion(usuario_actual):
    negocio_id = usuario_actual['negocio_id']
    try:
        negocio = Negocio.obtener_por_id(negocio_id)
        if negocio:
            return jsonify(negocio), 200
        return jsonify({"error": "Negocio no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/negocio/configuracion', methods=['PUT'])
@token_requerido
def actualizar_configuracion(usuario_actual):
    negocio_id = usuario_actual['negocio_id']
    datos = request.json
    try:
        Negocio.actualizar(negocio_id, datos)
        return jsonify({"mensaje": "Configuración actualizada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500