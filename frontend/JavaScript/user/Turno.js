document.addEventListener('DOMContentLoaded', () => {
    turnos();
    cargarDatosFormularioTurno();
});


let diasTrabajo = []; 
let fechaSeleccionada = ""; 
let horaSeleccionada = "";

document.getElementById('turno-profesional-id').addEventListener('change', function() {
    const profId = this.value;
    const selectServicio = document.getElementById('turno-servicio-id');
    
    if (!profId) {
        selectServicio.innerHTML = '<option value="">Primero seleccione un profesional...</option>';
        selectServicio.disabled = true;
        diasTrabajo = [];
        return;
    }
    try {
        const token = localStorage.getItem("token");
        
        // Cargar servicios
        const resServicios = await fetch(`${apiURL}/servicio/profesional/${profId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const servicios = await handleResponse(resServicios);
        
        selectServicio.innerHTML = '<option value="">Seleccione un servicio...</option>';
        if (servicios.length === 0) {
            selectServicio.innerHTML = '<option value="">Este profesional no tiene servicios asignados</option>';
            selectServicio.disabled = true;
        } else {
            servicios.forEach(s => {
                selectServicio.innerHTML += `<option value="${s.id}">${s.nombre || s.name} (${s.duracion} min)</option>`;
            });
            selectServicio.disabled = false;
        }

        //  Obtener días de trabajo para bloquear el calendario
        const resDias = await fetch(`${apiURL}/disponibilidad/dias/${profId}`);
        diasTrabajo = await resDias.json();
        
        // Si el calendario ya está abierto, actualizamos los bloqueos
        if (calendarioTurno) {
            calendarioTurno.set("disable", [
                function(date) { return !diasTrabajo.includes(date.getDay()); }
            ]);
            calendarioTurno.clear(); 
            document.getElementById('horarios-container').innerHTML = ''; 
        }

    } catch (error) {
        console.error(error);
    }
});

document.getElementById('turno-servicio-id').addEventListener('change', function() {
    if (fechaSeleccionada) buscarHorariosLibres();
});

function cargarDatosFormularioTurno() {
    const token = localStorage.getItem("token");
    
    fetch(`${apiURL}/cliente`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(clientes => {
        const selectCliente = document.getElementById('turno-cliente-id');
        selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.id}">${c.nombre || c.name}</option>`;
        });
        return fetch(`${apiURL}/profesional`, { headers: { 'Authorization': `Bearer ${token}` } });
    })
    .then(handleResponse)
    .then(profesionales => {
        const selectProfesional = document.getElementById('turno-profesional-id');
        selectProfesional.innerHTML = '<option value="">Seleccione un profesional...</option>';
        profesionales.forEach(p => {
            selectProfesional.innerHTML += `<option value="${p.id}">${p.nombre || p.name}</option>`;
        });
    })
    .catch(error => console.error(error));
}

function buscarHorariosLibres() {
    const profId = document.getElementById('turno-profesional-id').value;
    const servId = document.getElementById('turno-servicio-id').value;
    const container = document.getElementById('horarios-container');
    
    if (!profId || !servId || !fechaSeleccionada) {
        container.innerHTML = '<span style="color:gray; font-size:14px;">Seleccione profesional y servicio primero.</span>';
        return;
    }
    
    container.innerHTML = '<span style="color:gray;">Buscando horarios disponibles...</span>';
    
    fetch(`${apiURL}/disponibilidad/horarios/${profId}/${servId}/${fechaSeleccionada}`)
    .then(res => res.json())
    .then(horarios => {
        container.innerHTML = '';
        if (horarios.length === 0) {
            container.innerHTML = '<span style="color:#d9534f; font-weight:bold;">Agenda llena para este día.</span>';
            return;
        }
        horarios.forEach(hora => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerText = hora;
            btn.style = 'padding: 8px 15px; border: 1px solid #007bff; border-radius: 5px; cursor: pointer; background: white; color: #007bff; font-weight: bold; transition: 0.2s;';
            btn.onclick = () => {
                Array.from(container.children).forEach(b => {
                    b.style.background = 'white';
                    b.style.color = '#007bff';
                });
                btn.style.background = '#007bff';
                btn.style.color = 'white';
                horaSeleccionada = hora;
            };
            container.appendChild(btn);
        });
    })
    .catch(error => {
        console.error(error);
        container.innerHTML = '<span style="color:red;">Error al cargar horarios.</span>';
    });
}

function crearTurno(event) {
    event.preventDefault();
    if (!fechaSeleccionada || !horaSeleccionada) {
        alert("Por favor, seleccione un día en el calendario y haga clic en uno de los horarios disponibles.");
        return;
    }
    
    const token = localStorage.getItem("token");
    const datos = {
        cliente_id: document.getElementById('turno-cliente-id').value,
        profesional_id: document.getElementById('turno-profesional-id').value,
        servicio_id: document.getElementById('turno-servicio-id').value,
        fecha_hora: `${fechaSeleccionada} ${horaSeleccionada}` 
    };

    fetch(`${apiURL}/turno`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(datos)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error("No se puede asignar el turno:\n" + (errorData.error || "Error desconocido"));
            });
        }
        return handleResponse(response);
    })
    .then(() => {
        alert("Turno asignado correctamente.");
        turnos();
        cerrarFormularioTurno();
    })
    .catch(error => alert(error.message));
}

function turnos() {
    const token = localStorage.getItem("token");
    fetch(`${apiURL}/turnos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(turnosData => {
        const tbody = document.querySelector('#turnos .data-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            turnosData.forEach(t => {
                let fechaFormateada = t.fecha_hora || 'Sin fecha';
                let botonesAccion = '';
                const estadoActual = t.estado || 'Pendiente';
                
                if (estadoActual === 'Pendiente') {
                    botonesAccion = `
                        <button class="btn-primary" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" 
                            onclick="cambiarEstadoTurno(${t.id}, 'Completado')">Completado</button>
                        <button class="btn-danger" style="background-color: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" 
                            onclick="cambiarEstadoTurno(${t.id}, 'Ausente')">Ausente</button>
                    `;
                } else {
                    botonesAccion = `<span style="color: gray; font-style: italic; margin-right: 10px;">Turno ${estadoActual}</span>`;
                }
                
                const clienteSeguro = (t.cliente_nombre || t.cliente || '-').replace(/'/g, "\\'");
                const servicioSeguro = (t.servicio_nombre || t.servicio || '-').replace(/'/g, "\\'");
                botonesAccion += `
                    <button class="btn-primary" style="background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" 
                        onclick="generarPDFTurno(${t.id}, '${clienteSeguro}', '${servicioSeguro}', '${fechaFormateada}', '${estadoActual}')">Descargar PDF</button>
                `;
                
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
    })
    .catch(error => console.error("Error de conexión:", error));
}

function cambiarEstadoTurno(id, nuevoEstado) {
    if (!confirm(`¿Estás seguro de marcar este turno como ${nuevoEstado}?`)) return;
    
    const token = localStorage.getItem("token");
    fetch(`${apiURL}/turno/${id}/estado`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
    })
    .then(handleResponse)
    .then(() => turnos())
    .catch(error => console.error(error));
}

    window.generarPDFTurno = function(id, cliente, servicio, fechaHora, estado) {
    document.getElementById('pdf-id').innerText = id;
    document.getElementById('pdf-cliente').innerText = cliente;
    document.getElementById('pdf-servicio').innerText = servicio;
    document.getElementById('pdf-fecha').innerText = fechaHora;
    document.getElementById('pdf-estado').innerText = estado;

    // 2. Seleccionar elemento
    const elemento = document.getElementById('ticket-turno');
    
    //  el elemento siempre está "ahí" pero invisible para el usuario.

    const opciones = {
        margin:       10,
        filename:     `Turno_${cliente.replace(/\s+/g, '_')}_${id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 3. Generar PDF
    html2pdf().set(opciones).from(elemento).save();
};

