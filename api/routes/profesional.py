from api import app
from flask import jsonify, request
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido
from api.models.Profesional import Profesional

@app.route('/profesional', methods=['POST'])
def crear_profesional():
    datos = request.json
    sql = "INSERT INTO Profesional (nombre, especialidad, negocio_id) VALUES (%s, %s, %s)"
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500
            
        cursor = conn.cursor()
        cursor.execute(sql, (datos['nombre'], datos.get('especialidad'), datos['negocio_id']))
        conn.commit()
        return jsonify({"mensaje": "Profesional creado", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()



# Esta ruta es para listar los profesionales del local
@app.route('/profesionales', methods=['GET'])
@token_requerido
def get_profesionales(usuario_actual):
    negocio_id = usuario_actual['negocio_id']
    lista = Profesional.obtener_por_negocio(negocio_id)
    return jsonify(lista), 200

# Esta ruta es para ver los turnos que tiene asignados un profesional específico
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