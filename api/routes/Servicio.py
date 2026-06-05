from api import app
from flask import jsonify, request
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido
from api.models.Servicio import Servicio

@app.route('/servicio', methods=['GET', 'OPTIONS'])
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
    sql = "INSERT INTO Servicio (name, duracion, negocio_id) VALUES (%s, %s, %s)"
    
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
            
@app.route('/servicio/profesional/<int:prof_id>', methods=['GET', 'OPTIONS'])
@token_requerido
def servicios_por_profesional(usuario_actual, prof_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        

        sql = """
            SELECT s.id, s.name AS nombre, s.duracion 
            FROM Servicio s
            JOIN Profesional_Servicio ps ON s.id = ps.servicio_id
            WHERE ps.profesional_id = %s
        """
        cursor.execute(sql, (prof_id,))
        servicios = cursor.fetchall()
        
        cursor.close()
        connection.close()
        return jsonify(servicios), 200
        
    except Exception as e:
        print(f"Error al buscar servicios: {str(e)}")
        return jsonify({"error": "Error interno"}), 500
    

@app.route('/servicio/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_servicio(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        Servicio.eliminar(id, usuario_actual['negocio_id'])
        return jsonify({"message": "Servicio eliminado con éxito"}), 200
        
    except Exception as e:
        print(f"Error al eliminar servicio: {str(e)}")
        return jsonify({"error": "No se puede eliminar. Verifique que no tenga turnos activos."}), 500
    
@app.route('/servicio/<int:id>', methods=['PUT', 'OPTIONS'])
@token_requerido
def actualizar_servicio(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        datos = request.json
        print("DATOS RECIBIDOS EN FLASK:", datos)
        datos['negocio_id'] = usuario_actual['negocio_id']
        Servicio.actualizar(id, datos)
        return jsonify({"message": "Servicio actualizado exitosamente"}), 200
        
    except Exception as e:
        print(f"Error al actualizar servicio {id}: {str(e)}")
        return jsonify({"error": "Error interno al actualizar el servicio"}), 500