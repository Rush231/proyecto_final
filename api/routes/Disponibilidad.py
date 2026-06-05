from api import app
from flask import jsonify, request
from api.models.Disponibilidad import Disponibilidad
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from datetime import datetime, timedelta

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

@app.route('/disponibilidad/dias/<int:id_profesional>', methods=['GET'])
def dias_trabajo (id_profesional):
    conn = None
    try: 
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT dia_semana FROM Disponibilidad WHERE profesional_id = %s", (id_profesional,))
        dias = [row['dia_semana'] for row in cursor.fetchall()]
        return jsonify(dias), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()

@app.route('/disponibilidad/horarios/<int:profesional_id>/<int:servicio_id>/<fecha>', methods=['GET'])
def horarios_libres(profesional_id, servicio_id, fecha):
    """Calcula y devuelve los horarios disponibles restando los turnos ocupados"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Obtener duración del servicio
        cursor.execute("SELECT duracion FROM Servicio WHERE id = %s", (servicio_id,))
        servicio = cursor.fetchone()
        if not servicio:
            return jsonify([]), 404
        duracion = servicio['duracion']

    
        fecha_obj = datetime.strptime(fecha, '%Y-%m-%d')
        dia_bd = fecha_obj.weekday() + 1 if fecha_obj.weekday() < 6 else 0

        #  Obtener horario base del profesional para ese día
        cursor.execute("""
            SELECT hora_inicio, hora_fin 
            FROM Disponibilidad 
            WHERE profesional_id = %s AND dia_semana = %s
        """, (profesional_id, dia_bd))
        horario = cursor.fetchone()
        
        if not horario:
            return jsonify([]), 200 # No trabaja este día

        # Convertir a objetos time (compatible con cómo guardas en BD)
        h_inicio = datetime.strptime(str(horario['hora_inicio'])[-8:], '%H:%M:%S').time()
        h_fin = datetime.strptime(str(horario['hora_fin'])[-8:], '%H:%M:%S').time()

        # Obtener turnos ya reservados para esa fecha
        cursor.execute("""
            SELECT t.fecha_hora, s.duracion 
            FROM Turno t
            JOIN Servicio s ON t.servicio_id = s.id
            WHERE t.profesional_id = %s AND DATE(t.fecha_hora) = %s
        """, (profesional_id, fecha))
        turnos = cursor.fetchall()

        #  Generar intervalos (ej. de 30 en 30 min) 
        libres = []
        dt_actual = datetime.combine(fecha_obj.date(), h_inicio)
        dt_fin_jornada = datetime.combine(fecha_obj.date(), h_fin)

        while dt_actual + timedelta(minutes=duracion) <= dt_fin_jornada:
            dt_fin_estimado = dt_actual + timedelta(minutes=duracion)
            ocupado = False

            for t in turnos:
                t_inicio = t['fecha_hora']
                if isinstance(t_inicio, str):
                    t_inicio = datetime.strptime(t_inicio, '%Y-%m-%d %H:%M:%S')
                t_fin = t_inicio + timedelta(minutes=t['duracion'])
                
                # Si el rango de tiempo choca con un turno existente
                if dt_actual < t_fin and dt_fin_estimado > t_inicio:
                    ocupado = True
                    break
            
            if not ocupado:
                libres.append(dt_actual.strftime('%H:%M'))
            
            dt_actual += timedelta(minutes=30) # Saltos de 30 minutos (puedes ajustarlo)

        return jsonify(libres), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()