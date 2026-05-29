from api.db.db_config import get_db_connection

class Profesional:
    schema = {
        "name": str,
        "email": str,
        "password": str,
        "negocio_id": int,
        "id": int}
    def __init__(self, nombre, email, password, negocio_id, rol='profesional', especialidad=None, id=None):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.password = password 
        self.negocio_id = negocio_id
        self.rol = rol
        self.especialidad = especialidad


        def guardar(self, cursor):
            cursor.execute( (self.nombre, self.email, self.negocio_id, self.rol, self.especialidad))
            self.id = cursor.lastrowid
            return self.id
    
    @staticmethod
    def autenticar(cursor, email, password_ingresada):
        """Método estático para verificar login sin instanciar primero."""
        sql = "SELECT * FROM Profesional WHERE email = %s"
        cursor.execute(sql, (email,))
        data = cursor.fetchone() 
        
    def validar(cls, datos):
        if datos is None or type (datos) != dict:
            return False, "Datos inválidos"
        for key in cls.schema:
            if key not in datos:
                return False, f"Falta el campo: {key}"
            if type(datos[key]) != cls.schema[key]:
                return False, f"Tipo inválido para el campo: {key}"
        return None
    
    @staticmethod
    def obtener_por_negocio(negocio_id):
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
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
    
            sql_prof = "INSERT INTO Profesional (name, especialidad, negocio_id) VALUES (%s, %s, %s)"
            cursor.execute(sql_prof, (datos['nombre'], datos['especialidad'], datos['negocio_id']))
            nuevo_profesional_id = cursor.lastrowid
            
            sql_horario = """
                INSERT INTO Disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) 
                VALUES (%s, %s, %s, %s)
            """
            
            for dia in datos.get('dias_trabajo', []):
                cursor.execute(sql_horario, (
                    nuevo_profesional_id, 
                    dia, 
                    datos['hora_inicio'], 
                    datos['hora_fin']
                ))


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
            # 1. Actualizamos el perfil básico
            sql_prof = "UPDATE Profesional SET name = %s, especialidad = %s WHERE id = %s AND negocio_id = %s"
            cursor.execute(sql_prof, (datos['nombre'], datos['especialidad'], id, datos['negocio_id']))
            
            # 2. Borramos todos sus horarios viejos
            cursor.execute("DELETE FROM Profesional_Servicio WHERE profesional_id = %s", (id,))
            # Insertamos los marcados en el checkbox
            for servicio_id in datos.get('servicios', []):
                cursor.execute("INSERT INTO Profesional_Servicio (profesional_id, servicio_id) VALUES (%s, %s)", 
                               (id, servicio_id))
                
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
            # 1. Borramos la disponibilidad asociada primero
            cursor.execute("DELETE FROM Disponibilidad WHERE profesional_id = %s", (id,))
            # 2. Borramos al profesional
            cursor.execute("DELETE FROM Profesional WHERE id = %s AND negocio_id = %s", (id, negocio_id))
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()