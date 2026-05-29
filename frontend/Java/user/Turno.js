document.addEventListener('DOMContentLoaded', () => {
    cargarTurnos();
    cargarDatosFormularioTurno();
});

document.getElementById('turno-profesional-id').addEventListener('change', async function() {
    const profId = this.value;
    const selectServicio = document.getElementById('turno-servicio-id');
    
    if (!profId) {
        selectServicio.innerHTML = '<option value="">Primero seleccione un profesional...</option>';
        selectServicio.disabled = true;
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiURL}/servicios/profesional/${profId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const servicios = await handleResponse(response);
        
        selectServicio.innerHTML = '<option value="">Seleccione un servicio...</option>';
        
        if (servicios.length === 0) {
            selectServicio.innerHTML = '<option value="">Este profesional no tiene servicios asignados</option>';
            selectServicio.disabled = true;
            return;
        }

        servicios.forEach(s => {
            selectServicio.innerHTML += `<option value="${s.id}">${s.nombre || s.name} (${s.duracion} min)</option>`;
        });
        selectServicio.disabled = false;
        
    } catch (error) {
        console.error(error);
    }
});

async function cargarDatosFormularioTurno() {
    const token = localStorage.getItem("token");
    try {
        const resClientes = await fetch(`${apiURL}/clientes`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const clientes = await handleResponse(resClientes);
        const selectCliente = document.getElementById('turno-cliente-id');
        selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.id}">${c.nombre || c.name}</option>`;
        });

        const resProfesionales = await fetch(`${apiURL}/profesionales`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const profesionales = await handleResponse(resProfesionales);
        const selectProfesional = document.getElementById('turno-profesional-id');
        selectProfesional.innerHTML = '<option value="">Seleccione un profesional...</option>';
        profesionales.forEach(p => {
            selectProfesional.innerHTML += `<option value="${p.id}">${p.nombre || p.name}</option>`;
        });
    } catch (error) {
        console.error(error);
    }
}

function mostrarFormularioTurno() {
    document.getElementById('form-turno-container').classList.remove('hidden');
}

function cerrarFormularioTurno() {
    document.getElementById('form-turno-container').classList.add('hidden');
    document.getElementById('form-crear-turno').reset();
    const selectServicio = document.getElementById('turno-servicio-id');
    selectServicio.innerHTML = '<option value="">Primero seleccione un profesional...</option>';
    selectServicio.disabled = true;
}

async function crearTurno(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const datos = {
        cliente_id: document.getElementById('turno-cliente-id').value,
        profesional_id: document.getElementById('turno-profesional-id').value,
        servicio_id: document.getElementById('turno-servicio-id').value,
        fecha_hora: document.getElementById('turno-fecha-hora').value
    };

    try {
        const response = await fetch(`${apiURL}/turno`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datos)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            alert("No se puede asignar el turno:\n" + errorData.error);
            return; 
        }
        
        await handleResponse(response);
        
        alert("Turno asignado correctamente.");
        cargarTurnos();
        cerrarFormularioTurno();

    } catch (error) {
        console.error(error);
    }
}

async function cargarTurnos() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${apiURL}/turnos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const turnos = await handleResponse(response);
        
        const tbody = document.querySelector('#turnos .data-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            turnos.forEach(t => {
                let botonesAccion = '';
                const estadoActual = t.estado || 'Pendiente';
                
                if (estadoActual === 'Pendiente') {
                    botonesAccion = `
                        <button class="btn-primary" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" 
                            onclick="cambiarEstadoTurno(${t.id}, 'Completado')">
                            Completado
                        </button>
                        <button class="btn-danger" style="background-color: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" 
                            onclick="cambiarEstadoTurno(${t.id}, 'Ausente')">
                            Ausente
                        </button>
                    `;
                } else {
                    botonesAccion = `<span style="color: gray; font-style: italic;">Turno ${estadoActual}</span>`;
                }

                let fechaFormateada = t.fecha_hora || '-';

                tbody.innerHTML += `
                    <tr>
                        <td>${fechaFormateada}</td>
                        <td>${t.cliente_nombre || t.cliente || '-'}</td>
                        <td>${t.servicio_nombre || t.servicio || '-'}</td>
                        <td><strong>${estadoActual}</strong></td>
                        <td>${botonesAccion}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error(error);
    }
}

async function cambiarEstadoTurno(id, nuevoEstado) {
    if (!confirm(`¿Estás seguro de marcar este turno como ${nuevoEstado}?`)) {
        return;
    }

    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${apiURL}/turno/${id}/estado`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        await handleResponse(response);
        cargarTurnos(); 
        
    } catch (error) {
        console.error(error);
    }
}
