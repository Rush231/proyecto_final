from api import app
from flask import jsonify, request
from api.models.Disponibilidad import Disponibilidad
from api.db.db_config import get_db_connection
from api.db.db_config import mysql


@app.route('/disponibilidades', methods=['GET'])
def get_hay_disponibilidad():
    try:
         lista = Disponibilidad.get_hay_disponibilidad()
         return jsonify(lista), 200
    except Exception as e:
         return jsonify({"error": str(e)}), 400
    



@app.route('/disponibilidad', methods=['POST'])
def crear_disponibilidad():
    """Crea el horario de un profesional."""
    datos = request.json
    sql = "INSERT INTO Disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES (%s, %s, %s, %s)"
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500
            
        cursor = conn.cursor()
        cursor.execute(sql, (datos['profesional_id'], datos['dia_semana'], datos['hora_inicio'], datos['hora_fin']))
        conn.commit()
        return jsonify({"mensaje": "Disponibilidad creada", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()


