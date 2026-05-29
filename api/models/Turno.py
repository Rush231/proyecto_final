from api.db.db_config import get_db_connection
class Turno:
    def __init__(self, cliente_id, profesional_id, servicio_id, fecha_hora, estado='reservado', id=None):
        self.id = id
        self.cliente_id = cliente_id
        self.profesional_id = profesional_id
        self.servicio_id = servicio_id
        self.fecha_hora = fecha_hora
        self.estado = estado

    def guardar(self, cursor):
        # Aquí podrías agregar lógica extra, como validar disponibilidad antes de guardar
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
        
        # CORRECCIÓN: Usamos c.name y s.name para que coincidan con tu base de datos
        sql = """
            SELECT t.id, t.fecha_hora, t.estado, 
                   c.name AS cliente_nombre, 
                   s.name AS servicio_nombre
            FROM Turno t
            JOIN Cliente c ON t.cliente_id = c.id
            JOIN Servicio s ON t.servicio_id = s.id
            WHERE s.negocio_id = %s
            ORDER BY t.fecha_hora ASC
        """
        cursor.execute(sql, (negocio_id,))
        turnos = cursor.fetchall()
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