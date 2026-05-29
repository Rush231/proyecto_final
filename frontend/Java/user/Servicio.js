// Cargar servicios del negocio
async function cargarServicios() {
    const negocioId = localStorage.getItem("negocio_id");

    try {
        const response = await fetch(`${apiURL}/servicios/${negocioId}`);
        const servicios = await handleResponse(response);
        
        const tbody = document.querySelector('#servicios .data-table tbody');
        tbody.innerHTML = '';

        servicios.forEach(servicio => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${servicio.nombre}</td>
                <td>${servicio.duracion} min</td>
                <td>$${servicio.precio}</td>
                <td><button onclick="eliminarServicio(${servicio.id})">Eliminar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar servicios", error);
    }
}

// Crear un nuevo servicio
async function crearServicio(event) {
    event.preventDefault();
    const negocioId = localStorage.getItem("negocio_id");

    const datos = {
        nombre: document.getElementById('servicio-nombre').value,
        duracion: parseInt(document.getElementById('servicio-duracion').value),
        precio: parseFloat(document.getElementById('servicio-precio').value),
        negocio_id: negocioId
    };

    try {
        const response = await fetch(`${apiURL}/servicio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        await handleResponse(response);
        cargarServicios();
    } catch (error) {
        console.error("Error al crear servicio", error);
    }
}

async function eliminarServicio(id) {
    try {
        const response = await fetch(`${apiURL}/servicio/${id}`, {
            method: 'DELETE'
        });
        await handleResponse(response);
        cargarServicios();
    } catch (error) {
        console.error("Error al eliminar servicio", error);
    }
}