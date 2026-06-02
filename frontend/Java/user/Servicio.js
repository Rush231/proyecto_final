function mostrarFormularioServicio() {
    document.getElementById('form-servicio-container').classList.remove('hidden');
    document.getElementById('form-crear-servicio').reset();
    document.getElementById('servicio-id').value = ''; 
}

function cerrarFormularioServicio() {
    document.getElementById('form-servicio-container').classList.add('hidden');
    document.getElementById('form-crear-servicio').reset();
}

async function crearServicio(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const id = document.getElementById('input-servicio-id').value;

    const datos = {
        nombre: document.getElementById('servicio-nombre').value,
        duracion: document.getElementById('servicio-duracion').value
    };

    const url = id ? `${apiURL}/servicio/${id}` : `${apiURL}/servicio`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        if (response.ok) {
            alert(id ? "Servicio actualizado" : "Servicio creado");
            cerrarFormularioServicio();
            cargarServicios(); // Recarga la tabla
        } else {
            const error = await response.json();
            alert("Error: " + error.message);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

async function guardarServicio(event) {
    event.preventDefault();
    const id = document.getElementById('servicio-id').value;
    const datos = {
        nombre: document.getElementById('servicio-nombre').value,
        duracion: document.getElementById('servicio-duracion').value,
    };

    const url = id ? `${apiURL}/servicio/${id}` : `${apiURL}/servicio`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datos)
        });
        
        if (response.ok) {
            alert("Servicio guardado exitosamente");
            cargarServicios(); // Recargar tabla
            cerrarFormularioServicio();
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

async function eliminarServicio(id) {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) {
        return;
    }
    
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${apiURL}/servicio/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        await handleResponse(response);
        cargarServicios();
        
    } catch (error) {
        console.error(error);
        alert("Error al eliminar el servicio.");
    }
}

async function cargarServicios() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${apiURL}/servicios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const servicios = await handleResponse(response);
        
        const tbody = document.querySelector('#tabla-servicios tbody');
        if (tbody) {
            tbody.innerHTML = '';
            servicios.forEach(s => {
                const servicioJson = JSON.stringify(s).replace(/"/g, '&quot;');
                tbody.innerHTML += `
                    <tr>
                            <td>${s.nombre || s.name}</td>
                            <td>${s.duracion} min</td>
                            <td>
                                <button class="btn-danger" onclick="eliminarServicio(${s.id})">Eliminar</button>
                                <button class="btn-primary" onclick="editarServicio('${servicioJson}')">Editar</button>
                            </td>
                        </tr>
                    `;
            });
        }
    } catch (error) {
        console.error(error);
    }
}
window.editarServicio = async function(servicioStr) {
    try {
        //. Parsear el objeto
        const s = JSON.parse(servicioStr.replace(/&quot;/g, '"'));
        console.log("Editando:", s); // Mira esto en F12 para verificar que 's' tiene datos

        //  Obtener elementos con validación
        const elId = document.getElementById('servicio-id');
        const elNombre = document.getElementById('servicio-nombre');
        const elDuracion = document.getElementById('servicio-duracion');
        const elTitulo = document.getElementById('titulo-formulario');

        //  Asignación con chequeo de existencia
        if (elId) elId.value = s.id || '';
        if (elNombre) elNombre.value = s.nombre || s.name || '';
        if (elDuracion) elDuracion.value = s.duracion || '';
        if (elTitulo) elTitulo.innerText = "Editar Servicio";

        //  Mostrar contenedor
        const container = document.getElementById('form-servicio-container');
        if (container) {
            container.classList.remove('hidden');
        } else {
            console.error("No se encontró #form-servicio-container");
        }

    } catch (err) {
        console.error("Error al editar:", err);
    }
};
document.addEventListener('DOMContentLoaded', cargarServicios);