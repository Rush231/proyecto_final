from api import app
from flask import jsonify, request
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido
from api.models.Turno import Turno


@app.route('/turno', methods=['POST', 'OPTIONS'])
@token_requerido
def crear_turno(usuario_actual):
    if request.method == 'OPTIONS':
        return jsonify({}),  200

    try:
        datos = request.json
        datos['negocio_id'] = usuario_actual['negocio_id']


        es_valido, mensaje = Turno.validar(datos)
        
        es_valido_horario, mensaje_horario = Turno.validar_disponibilidad(
            profesional_id=datos['profesional_id'],
            servicio_id=datos['servicio_id'],
            fecha_hora_str=datos['fecha_hora']
        )
        if not es_valido_horario:
            return jsonify({"error": mensaje_horario}), 400

        nuevo_id = Turno.registrar(datos)
        return jsonify({"message": "Turno creado con éxito", "id": nuevo_id}), 201

    except Exception as e:
        print(f"Error al crear turno: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500



@app.route('/turnos', methods=['GET'])
@token_requerido
def get_todos_los_turnos(usuario_actual):
    try:
        # Filtramos por el ID del negocio que viene en el token
        negocio_id = usuario_actual['negocio_id']
        lista = Turno.obtener_por_negocio(negocio_id)
        
        return jsonify(lista), 200
        
    except Exception as e:

        print(f"Error interno en /turnos: {str(e)}") 
        return jsonify({"error": str(e)}), 500

@app.route('/turno/<int:id>', methods=['DELETE', 'OPTIONS'])
@token_requerido
def eliminar_turno(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        fue_eliminado = Turno.eliminar(id, usuario_actual['negocio_id'])
        if fue_eliminado:
            return jsonify({"message": "Turno eliminado con éxito"}), 200
        else:
            return jsonify({"error": "No se encontró el turno o no pertenece a tu negocio"}), 404
    except Exception as e:
        print(f"Error al eliminar el turno {id}: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/turno/<int:id>/estado', methods=['PUT', 'OPTIONS'])
@token_requerido
def actualizar_estado_turno(usuario_actual, id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        datos = request.json
        nuevo_estado = datos.get('estado')
        
        if not nuevo_estado:
            return jsonify({"error": "No se envió el nuevo estado"}), 400
            
        Turno.cambiar_estado(id, nuevo_estado, usuario_actual['negocio_id'])
        
        return jsonify({"message": f"Turno marcado como {nuevo_estado}"}), 200
        
    except Exception as e:
        print(f"Error al cambiar estado: {str(e)}")
        return jsonify({"error": "Error interno"}), 500