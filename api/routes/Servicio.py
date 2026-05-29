from api import app
from flask import jsonify, request
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido
from api.models.Servicio import Servicio

@app.route('/servicios', methods=['GET', 'OPTIONS'])
@token_requerido
def get_todos_los_servicios(usuario_actual):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        # Extraemos el negocio_id del token de forma segura
        negocio_id = usuario_actual['negocio_id']
        lista = Servicio.obtener_por_negocio(negocio_id)
        
        return jsonify(lista), 200
        
    except Exception as e:
        # Esto imprimirá el error real en tu terminal si falla algo
        print(f"Error interno en /servicios: {str(e)}") 
        return jsonify({"error": str(e)}), 500

@app.route('/servicio', methods=['POST'])
@token_requerido
def crear_servicio(usuario_actual):
    datos = request.json
    datos['negocio_id'] = usuario_actual['negocio_id']
    datos = request.json
    sql = "INSERT INTO Servicio (nombre, duracion, negocio_id) VALUES (%s, %s, %s)"
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500
            
        cursor = conn.cursor()
        cursor.execute(sql, (datos['nombre'], datos['duracion'], datos['negocio_id']))
        conn.commit()
        return jsonify({"mensaje": "Servicio creado", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()
            
@app.route('/servicios/profesional/<int:profesional_id>', methods=['GET', 'OPTIONS'])
@token_requerido
def get_servicios_por_profesional(usuario_actual, profesional_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        # Llamamos a la nueva función del modelo
        lista = Servicio.obtener_por_profesional(profesional_id)
        return jsonify(lista), 200
        
    except Exception as e:
        print(f"Error interno en /servicios/profesional: {str(e)}") 
        return jsonify({"error": str(e)}), 500