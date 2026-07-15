function mostrarFormularioServicio() {
    document.getElementById('form-servicio-container').classList.remove('hidden');
    document.getElementById('form-crear-servicio').reset();
    document.getElementById('input-servicio-id').value = ''; 
}

function cerrarFormularioServicio() {
    document.getElementById('form-servicio-container').classList.add('hidden');
    document.getElementById('form-crear-servicio').reset();
}

function crearServicio(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const id = document.getElementById('input-servicio-id').value;

    const datos = {
        nombre: document.getElementById('servicio-nombre').value,
    
        duracion: parseInt(document.getElementById('servicio-duracion').value)
    };

    const url = id ? `${apiURL}/servicio/${id}` : `${apiURL}/servicio`;
    const metodo = id ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(respuesta => {
        if (respuesta.ok) {
            alert(id ? "Servicio actualizado con éxito" : "Servicio creado con éxito");
            cerrarFormularioServicio();
            cargarServicios(); // Refresca los datos visibles en la tabla
        } else {
            
            return respuesta.json().then(errorServidor => { 
                throw new Error(errorServidor.error || "Error inesperado en la base de datos"); 
            });
        }
    })
    .catch(error => {
        console.error("Detalle del error en la petición:", error);
        alert("Hubo un problema: " + error.message);
    });
}

function eliminarServicio(id) {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) { return; }
    const token = localStorage.getItem("token");

    fetch(`${apiURL}/servicio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(() => {
        cargarServicios();
    })
    .catch(error => {
        console.error(error);
        alert("Error al eliminar el servicio.");
    });
}

function cargarServicios() {
    const token = localStorage.getItem("token");
    
    fetch(`${apiURL}/servicio`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(servicios => {
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
    })
    .catch(error => console.error(error));
}
window.editarServicio = async function(servicioStr) {
    try {
        //. Parsear el objeto
        const s = JSON.parse(servicioStr.replace(/&quot;/g, '"'));
        console.log("Editando:", s); // Mira esto en F12 para verificar que 's' tiene datos

        //  Obtener elementos con validación
        const elId = document.getElementById('input-servicio-id');
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