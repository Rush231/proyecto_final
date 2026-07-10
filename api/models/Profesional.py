from multiprocessing.dummy import connection

from api.db.db_config import get_db_connection

class Profesional:
    esquema = {
        'nombre': str,
        'especialidad': str,
        'dias_trabajo': list,
        'hora_inicio': str,
        'hora_fin': str,
        'servicios': list
    }

    @staticmethod
    def obtener_por_negocio(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Profesional")
        print("PYTHON VE ESTOS PROFESIONALES EN LA TABLA:", cursor.fetchall())
        
        sql = """
            SELECT 
                p.id, 
                p.name AS nombre, 
                p.especialidad,
                GROUP_CONCAT(d.dia_semana SEPARATOR ', ') AS dias_trabajo,
                MAX(d.hora_inicio) AS hora_inicio,
                MAX(d.hora_fin) AS hora_fin
            FROM Profesional p
            LEFT JOIN Disponibilidad d ON p.id = d.profesional_id
            WHERE p.negocio_id = %s
            GROUP BY p.id, p.name, p.especialidad
        """
        cursor.execute(sql, (negocio_id,))
        profesionales = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        for prof in profesionales:
            if prof['hora_inicio'] is not None:
                prof['hora_inicio'] = str(prof['hora_inicio'])
            if prof['hora_fin'] is not None:
                prof['hora_fin'] = str(prof['hora_fin'])

        return profesionales
    
    @classmethod
    def registrar(cls, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            #  Insertar datos básicos del Profesional
            sql_prof = "INSERT INTO Profesional (name, especialidad, negocio_id) VALUES (%s, %s, %s)"
            cursor.execute(sql_prof, (datos['nombre'], datos['especialidad'], datos['negocio_id']))
            nuevo_profesional_id = cursor.lastrowid
            
            #  Insertar los días y horarios (Disponibilidad)
            sql_horario = """
                INSERT INTO Disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) 
                VALUES (%s, %s, %s, %s)
            """
            for dia in datos.get('dias_trabajo', []):
                cursor.execute(sql_horario, (nuevo_profesional_id, dia, datos['hora_inicio'], datos['hora_fin']))

            #  Insertar los servicios vinculados (Profesional_Servicio)
            sql_servicio = "INSERT INTO Profesional_Servicio (profesional_id, servicio_id) VALUES (%s, %s)"
            for servicio_id in datos.get('servicios', []):
                cursor.execute(sql_servicio, (nuevo_profesional_id, servicio_id))
            
            connection.commit()
            return nuevo_profesional_id
            
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()

    @classmethod
    def actualizar(cls, id, datos):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            #  Actualizamos el perfil básico
            sql_prof = "UPDATE Profesional SET name = %s, especialidad = %s WHERE id = %s AND negocio_id = %s"
            cursor.execute(sql_prof, (datos['nombre'], datos['especialidad'], id, datos['negocio_id']))
            
            # Actualizamos los servicios 
            cursor.execute("DELETE FROM Profesional_Servicio WHERE profesional_id = %s", (id,))
            sql_servicio = "INSERT INTO Profesional_Servicio (profesional_id, servicio_id) VALUES (%s, %s)"
            for servicio_id in datos.get('servicios', []):
                cursor.execute(sql_servicio, (id, servicio_id))
                
            #  Actualizamos los horarios 
            cursor.execute("DELETE FROM Disponibilidad WHERE profesional_id = %s", (id,))
            sql_horario = "INSERT INTO Disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES (%s, %s, %s, %s)"
            for dia in datos.get('dias_trabajo', []):
                cursor.execute(sql_horario, (id, dia, datos['hora_inicio'], datos['hora_fin']))
                
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()

    @classmethod
    def eliminar(cls, id, negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor()
        
        try:
            #  Borramos la disponibilidad asociada
            cursor.execute("DELETE FROM Disponibilidad WHERE profesional_id = %s", (id,))
            
            #  Borramos los servicios asociados
            cursor.execute("DELETE FROM Profesional_Servicio WHERE profesional_id = %s", (id,))
            
            #  borramos al profesional
            cursor.execute("DELETE FROM Profesional WHERE id = %s AND negocio_id = %s", (id, negocio_id))
            
            filas_borradas = cursor.rowcount
            connection.commit()
            
            return filas_borradas > 0
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()

    @classmethod
    def validar(cls, datos):
        if not datos or not isinstance(datos, dict):
            return False, "Los datos proporcionados no son válidos."
        
        for campo, tipo_esperado in cls.esquema.items():
            if campo not in datos:
                return False, f"Falta el campo obligatorio: '{campo}'"
            
            if not isinstance(datos[campo], tipo_esperado):
                return False, f"El campo '{campo}' debe ser de tipo {tipo_esperado.__name__}"


        return True, "Datos válidos"