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

    const datos = {
        nombre: document.getElementById('servicio-nombre').value,
        duracion: document.getElementById('servicio-duracion').value
    };

    try {
        const response = await fetch(`${apiURL}/servicio`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datos)
        });
        
        await handleResponse(response);
        
        cargarServicios(); 
        cerrarFormularioServicio();
        
    } catch (error) {
        console.error(error);
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
                tbody.innerHTML += `
                    <tr>
                            <td>${s.nombre || s.name}</td>
                            <td>${s.duracion} min</td>
                            <td>
                                <button class="btn-danger" onclick="eliminarServicio(${s.id})">Eliminar</button>
                            </td>
                        </tr>
                    `;
            });
        }
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', cargarServicios);