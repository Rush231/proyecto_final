from api import app
from flask import jsonify, request
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido
from api.models.Turno import Turno

@app.route('/turno', methods=['POST'])
def crear_turno():
    """Crea un nuevo turno (la reserva)."""
    datos = request.json
    # Se esperan: cliente_id, profesional_id, servicio_id, fecha_hora
    sql = "INSERT INTO Turno (cliente_id, profesional_id, servicio_id, fecha_hora, estado) VALUES (%s, %s, %s, %s, 'reservado')"
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500

        # ---
        # NOTA IMPORTANTE: Aquí faltaría la validación de disponibilidad.
        # verificar que:
        # 1. La 'fecha_hora' esté dentro de la 'Disponibilidad' del profesional.
        # 2. No se superponga con otro 'Turno' existente para ese profesional.
        # ---
        
        cursor = conn.cursor()
        cursor.execute(sql, (datos['cliente_id'], datos['profesional_id'], datos['servicio_id'], datos['fecha_hora']))
        conn.commit()
        return jsonify({"mensaje": "Turno creado exitosamente", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()


@app.route('/turnos', methods=['GET'])
@token_requerido
def get_todos_los_turnos(usuario_actual):
    try:
        # Filtramos por el ID del negocio que viene en el token
        negocio_id = usuario_actual['negocio_id']
        lista = Turno.obtener_por_negocio(negocio_id)
        
        return jsonify(lista), 200
        
    except Exception as e:
        # Si algo falla en la BD, ahora el servidor enviará un JSON con el error real
        # en lugar de romperse y causar un falso error de CORS.
        print(f"Error interno en /turnos: {str(e)}") 
        return jsonify({"error": str(e)}), 500

@app.route('/turno/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_turno(usuario_actual, id):
    # 1. Responder al Preflight de CORS del navegador
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        # 2. Llamamos al modelo para borrar el registro
        Turno.eliminar(id)
        return jsonify({"message": "Turno cancelado y eliminado con éxito"}), 200
        
    except Exception as e:
        print(f"Error al eliminar el turno {id}: {str(e)}")
        return jsonify({"error": str(e)}), 500