Sistema de Gestión de Turnos (SaaS) 

Tecnologías Utilizadas
backend:
*Python
*Fask
*mysql
frontend:
html
css
javaScript puro

Estructura del sistema 

proyecto_final/
api/                    # Lógica del servidor y API RESTful
db/                 # Scripts SQL (creación de base de datos y usuarios) y configuración
models/             # Modelos de datos (Usuario, Cliente, Turno, Negocio, etc.)
routes/             # Controladores y definición de endpoints
utils/              # Utilidades, incluyendo la verificación de seguridad/tokens
frontend/               # Interfaz de usuario
css/                # Hojas de estilo generales y específicas (ej. login)
html/               # Vistas principales (login, dashboard)
JavaScript/         # Lógica modular del cliente separada por entidades (Turno, Cliente, etc.)
settings/
requeriments.txt    # Dependencias de Python necesarias para el backend
main.py                 # Archivo de entrada para levantar el servidor Flask


Instalación y Configuración Local
Sigue estos pasos para desplegar el proyecto en tu entorno de desarrollo:

1. Preparar la Base de Datos
Asegúrate de tener MySQL instalado y en ejecución.

Ejecuta el script api/db/create_db.sql para generar la estructura de tablas.

(Opcional) Ejecuta api/db/create_user.sql para configurar los permisos de acceso de la aplicación.

2. Configurar el Backend
Abre una terminal en el directorio raíz del proyecto.

Crea y activa un entorno virtual de Python:

python -m venv venv
source venv/bin/activate  # En Linux/Mac
venv\Scripts\activate     # En Windows


Instala las dependencias listadas en el archivo de requerimientos:

pip install -r settings/requeriments.txt


Inicia el servidor: 
python main.py


