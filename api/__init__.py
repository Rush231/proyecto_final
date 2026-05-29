from flask import Flask
from flask import jsonify
from flask_cors import CORS
 
app = Flask(__name__)

# Configuración CORS explícita para permitir cualquier conexión local
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return response
@app.route('/')
def test():
    return jsonify({"mensaje": "ruta del index"})

app.config['SECRET_KEY'] = "clave_api"

import api.routes.Cliente
import api.routes.Disponibilidad
import api.routes.Usuario
import api.routes.Negocio
import api.routes.profesional
import api.routes.Servicio
import api.routes.Turno