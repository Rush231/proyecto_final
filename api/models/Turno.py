from api.db.db_config import get_db_connection
from datetime import datetime, timedelta
class Turno:
    def __init__(self, cliente_id, profesional_id, servicio_id, fecha_hora, estado='reservado', id=None):
        self.id = id
        self.cliente_id = cliente_id
        self.profesional_id = profesional_id
        self.servicio_id = servicio_id
        self.fecha_hora = fecha_hora
        self.estado = estado

    def guardar(self, cursor):
        sql = """
            INSERT INTO Turno (cliente_id, profesional_id, servicio_id, fecha_hora, estado) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (self.cliente_id, self.profesional_id, self.servicio_id, self.fecha_hora, self.estado))
        self.id = cursor.lastrowid
        return self.id
    
    @staticmethod
    def obtener_por_profesional(cursor, profesional_id):
        sql = """
            SELECT t.id, t.fecha_hora, t.estado, c.nombre as cliente_nombre, s.nombre as servicio_nombre
            FROM Turno t
            JOIN Cliente c ON t.cliente_id = c.id
            JOIN Servicio s ON t.servicio_id = s.id
            WHERE t.profesional_id = %s
        """
        cursor.execute(sql, (profesional_id,))
        
        return cursor.fetchall()
    

    @staticmethod
    def obtener_por_negocio(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        sql = """
            SELECT t.id, t.fecha_hora, t.estado, t.profesional_id,
                   c.name AS cliente_nombre, 
                   s.name AS servicio_nombre,
                   p.name AS profesional_nombre
            FROM Turno t
            JOIN Cliente c ON t.cliente_id = c.id
            JOIN Servicio s ON t.servicio_id = s.id
            JOIN Profesional p ON t.profesional_id = p.id
            WHERE s.negocio_id = %s
            ORDER BY t.fecha_hora ASC
        """
        cursor.execute(sql, (negocio_id,))
        turnos = cursor.fetchall()
        
        # Formatear la fecha a texto estricto para evitar el desfase horario en JavaScriptscript
        for t in turnos:
            if t['fecha_hora']:
                t['fecha_hora'] = t['fecha_hora'].strftime('%d/%m/%Y %H:%M')
                
        cursor.close()
        connection.close()
        return turnos
    @staticmethod
    def eliminar(turno_id):
        """Elimina un turno físico de la base de datos por su ID."""
        connection = get_db_connection()
        cursor = connection.cursor()
        
        sql = "DELETE FROM Turno WHERE id = %s"
        cursor.execute(sql, (turno_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        return True
    @classmethod
    def validar_disponibilidad(cls, profesional_id, servicio_id, fecha_hora_str):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            # El input de HTML5 envía el formato 'YYYY-MM-DDTHH:MM'
            fecha_inicio = datetime.strptime(fecha_hora_str, '%Y-%m-%d %H:%M')

            # Calcula a qué hora termina este nuevo turno
            cursor.execute("SELECT duracion FROM Servicio WHERE id = %s", (servicio_id,))
            servicio = cursor.fetchone()
            if not servicio:
                return False, "El servicio seleccionado no existe."

            duracion_minutos = servicio['duracion']
            fecha_fin = fecha_inicio + timedelta(minutes=duracion_minutos)

            #  Valida si trabaja ese día y en ese horario
            dia_bd = fecha_inicio.weekday() + 1 if fecha_inicio.weekday() < 6 else 0

            cursor.execute("""
                SELECT hora_inicio, hora_fin 
                FROM Disponibilidad 
                WHERE profesional_id = %s AND dia_semana = %s
            """, (profesional_id, dia_bd))
            
            horario = cursor.fetchone()

            if not horario:
                return False, "El profesional no trabaja en este día de la semana."

            h_inicio = datetime.strptime(str(horario['hora_inicio'])[-8:], '%H:%M:%S').time()
            h_fin = datetime.strptime(str(horario['hora_fin'])[-8:], '%H:%M:%S').time()

            if fecha_inicio.time() < h_inicio or fecha_fin.time() > h_fin:
                return False, f"El horario del profesional para este día es de {h_inicio.strftime('%H:%M')} a {h_fin.strftime('%H:%M')}."


            cursor.execute("""
                SELECT t.fecha_hora, s.duracion 
                FROM Turno t
                JOIN Servicio s ON t.servicio_id = s.id
                WHERE t.profesional_id = %s AND DATE(t.fecha_hora) = DATE(%s)
            """, (profesional_id, fecha_inicio.date()))

            turnos_del_dia = cursor.fetchall()


            for t in turnos_del_dia:
                t_exist_inicio = t['fecha_hora'] 
                t_exist_fin = t_exist_inicio + timedelta(minutes=t['duracion'])

                if fecha_inicio < t_exist_fin and fecha_fin > t_exist_inicio:
                    hora_i_formateada = t_exist_inicio.strftime('%H:%M')
                    hora_f_formateada = t_exist_fin.strftime('%H:%M')
                    return False, f"Turno ocupado: El profesional ya tiene una reserva de {hora_i_formateada} a {hora_f_formateada}."

            # Si sobrevivió a todas las pruebas, está libre
            return True, "Disponible"

        finally:
            cursor.close()
            connection.close()
    @classmethod
    def registrar(cls, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:

            sql = """
                INSERT INTO Turno (cliente_id, profesional_id, servicio_id, fecha_hora, negocio_id, estado) 
                VALUES (%s, %s, %s, %s, %s, 'Pendiente')
            """
            
            cursor.execute(sql, (
                datos['cliente_id'],
                datos['profesional_id'],
                datos['servicio_id'],
                datos['fecha_hora'],
                datos['negocio_id']
            ))
            
            nuevo_id = cursor.lastrowid
            connection.commit()
            return nuevo_id
            
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()

    @classmethod
    def cambiar_estado(cls, id, nuevo_estado, negocio_id):
            connection = get_db_connection()
            cursor = connection.cursor()
            
            try:
               
                sql = "UPDATE turno SET estado = %s WHERE id = %s"
               
                cursor.execute(sql, (nuevo_estado, id))
                
                connection.commit()
            except Exception as e:
                connection.rollback()
                raise e
            finally:
                cursor.close()
                connection.close()