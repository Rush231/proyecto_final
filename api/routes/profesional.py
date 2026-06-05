from api import app
from flask import jsonify, request
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido
from api.models.Profesional import Profesional

@app.route('/profesional', methods=['POST', 'OPTIONS'])
@token_requerido
def crear_profesional(usuario_actual):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        datos = request.json
        datos['negocio_id'] = usuario_actual['negocio_id']
        
        nuevo_id = Profesional.registrar(datos)
        
        return jsonify({"mensaje": "Profesional creado exitosamente", "id": nuevo_id}), 201
        
    except Exception as e:
        print(f"Error al crear profesional: {str(e)}")
        return jsonify({"error": "No se pudo crear el profesional. Revisa los datos."}), 500



@app.route('/profesional', methods=['GET'])
@token_requerido
def get_profesionales(usuario_actual):
    print("DATOS DEL TOKEN RECIBIDO:", usuario_actual)
    negocio_id = usuario_actual['negocio_id']
    lista = Profesional.obtener_por_negocio(negocio_id)
    return jsonify(lista), 200

@app.route('/turnos/profesional/<int:profesional_id>', methods=['GET'])
@token_requerido
def get_turnos_profesional(usuario_actual, profesional_id):
    """Obtiene todos los turnos de un profesional (para su agenda)."""
    sql = """
        SELECT t.id, t.fecha_hora, t.estado, 
               c.nombre AS nombre_cliente, 
               s.nombre AS nombre_servicio, s.duracion
        FROM Turno t
        JOIN Cliente c ON t.cliente_id = c.id
        JOIN Servicio s ON t.servicio_id = s.id
        WHERE t.profesional_id = %s
        ORDER BY t.fecha_hora ASC
    """
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, (profesional_id,))
        turnos = cursor.fetchall()
        return jsonify(turnos), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()


@app.route('/profesional/<int:id>', methods=['PUT', 'OPTIONS'])
@token_requerido
def actualizar_profesional(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        datos = request.json
        datos['negocio_id'] = usuario_actual['negocio_id']
        Profesional.actualizar(id, datos)
        return jsonify({"message": "Profesional actualizado exitosamente"}), 200
        
    except Exception as e:
        print(f"Error al actualizar profesional {id}: {str(e)}")
        return jsonify({"error": "Error interno al actualizar el profesional"}), 500


@app.route('/profesional/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_profesional(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        Profesional.eliminar(id, usuario_actual['negocio_id'])
        return jsonify({"message": "Profesional eliminado con éxito"}), 200
        
    except Exception as e:
        print(f"Error al eliminar profesional {id}: {str(e)}")
        return jsonify({"error": "Error interno o el profesional tiene turnos asociados"}), 500