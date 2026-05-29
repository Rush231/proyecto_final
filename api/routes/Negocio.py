from api import app
from flask import jsonify, request
from api.models.Negocio import Negocio
from api.db.db_config import get_db_connection
from api.db.db_config import mysql
from api.utils.seguridad import token_requerido

@app.route('/crear_negocio', methods=['POST'])
def crear_negocio():
    datos = request.json
    sql = "INSERT INTO Negocio (nombre, tipo) VALUES (%s, %s)"
    
    conn = get_db_connection()

    try:
        if conn is None:
            return jsonify({"error": "Error de conexión"}), 500
        
        cursor = conn.cursor()
        cursor.execute(sql, (datos['nombre'], datos['tipo']))
        conn.commit()
        return jsonify({"mensaje": "Negocio creado", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn:
            cursor.close()
            conn.close()


@app.route('/negocios', methods=['GET'])
def get_todos_negocios():
    try:
         lista = Negocio.get_todos_negocios()
         return jsonify(lista), 200
    except Exception as e:
         return jsonify({"error": str(e)}), 400
    


