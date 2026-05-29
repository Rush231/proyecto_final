// Cargar servicios del negocio
async function cargarServicios() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${apiURL}/servicios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const servicios = await handleResponse(response);
        
        const tbody = document.querySelector('#servicios .data-table tbody');
        if(tbody) tbody.innerHTML = '';

        servicios.forEach(servicio => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${servicio.nombre || servicio.name}</td>
                <td>${servicio.duracion} min</td>
                <td>--</td>
                <td><button class="btn-secondary" onclick="eliminarServicio(${servicio.id})">Eliminar</button></td>
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
    const token = localStorage.getItem("token");

    const datos = {
        nombre: document.getElementById('servicio-nombre').value,
        duracion: parseInt(document.getElementById('servicio-duracion').value)
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
        cargarServicios(); // Recargar la tabla
    } catch (error) {
        console.error("Error al crear servicio", error);
    }
}