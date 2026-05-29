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
    # Filtramos por el ID del negocio que viene en el token
    negocio_id = usuario_actual['negocio_id']
    lista = Turno.obtener_por_negocio(negocio_id)
    return jsonify(lista), 200

