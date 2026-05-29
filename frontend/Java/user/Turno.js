// Cargar turnos del negocio
async function cargarTurnos() {
    const negocioId = localStorage.getItem("negocio_id");

    try {
        const response = await fetch(`${apiURL}/turnos/negocio/${negocioId}`);
        const turnos = await handleResponse(response);
        
        const tbody = document.querySelector('#turnos .data-table tbody');
        tbody.innerHTML = '';

        turnos.forEach(turno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${turno.fecha}</td>
                <td>${turno.hora}</td>
                <td>${turno.cliente_id}</td>
                <td>${turno.profesional_id}</td>
                <td><button>Cancelar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar turnos", error);
    }
}

// Asignar un turno
async function crearTurno(event) {
    event.preventDefault();

    const datos = {
        cliente_id: parseInt(document.getElementById('turno-cliente-id').value),
        profesional_id: parseInt(document.getElementById('turno-profesional-id').value),
        servicio_id: parseInt(document.getElementById('turno-servicio-id').value),
        fecha: document.getElementById('turno-fecha').value,
        hora: document.getElementById('turno-hora').value
    };

    try {
        const response = await fetch(`${apiURL}/turno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        await handleResponse(response);
        cargarTurnos();
    } catch (error) {
        console.error("Error al crear turno", error);
    }
}