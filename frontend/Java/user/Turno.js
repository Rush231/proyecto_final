document.addEventListener('DOMContentLoaded', () => {
    turnos();
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

let calendarioTurno = null;
function mostrarFormularioTurno() {
    document.getElementById('form-turno-container').classList.remove('hidden');
    document.getElementById('form-turno-container').classList.remove('hidden');
    document.getElementById('form-crear-turno').reset();

    // Lógica para bloquear días pasados
    const inputFecha = document.getElementById('turno-fecha-hora');
    
    // Obtener fecha y hora en el momento exacto en el que se abre el formulario
    const ahora = new Date();
    
    // Ajustar a la zona horaria local 
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    
    // Cortar el texto para que quede en el formato YYYY-MM-DDTHH:MM
    const fechaMinima = ahora.toISOString().slice(0, 16);
    
    // Asignar el límite mínimo
    inputFecha.min = fechaMinima;

    calendarioTurno = flatpickr("#turno-fecha-hora", {
        enableTime: true,           // Permitir elegir hora
        dateFormat: "Y-m-d H:i",    // Formato compatible con tu base de datos
        locale: "es",               // Idioma español
        minDate: "today",           // Bloquear fechas del pasado
        time_24hr: true,            // Reloj de 24 horas (sin AM/PM)
        minuteIncrement: 15         // Que los minutos salten de 15 en 15 (opcional)
    });
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
        turnos();
        cerrarFormularioTurno();

    } catch (error) {
        console.error(error);
    }
}

async function turnos() {
    const token = localStorage.getItem("token");
    console.log("Intentando cargar turnos..."); // DEBUG
    try {
        const response = await fetch(`${apiURL}/turnos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Verifica si la respuesta es ok antes de procesar
        if (!response.ok) {
            const err = await response.json();
            console.error("Error del servidor:", err);
            return;
        }

        const turnos = await response.json();
        
        const tbody = document.querySelector('#turnos .data-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            turnos.forEach(t => {
                let fechaFormateada = t.fecha_hora || 'Sin fecha';
                let botonesAccion = '';
                const estadoActual = t.estado || 'Pendiente';
                
                if (estadoActual === 'Pendiente') {
                    botonesAccion = `
                            <button class="btn-primary" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" 
                                onclick="cambiarEstadoTurno(${t.id}, 'Completado')">
                                Completado
                            </button>
                            <button class="btn-danger" style="background-color: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" 
                                onclick="cambiarEstadoTurno(${t.id}, 'Ausente')">
                                Ausente
                            </button>
                        `;
                    } else {
                        botonesAccion = `<span style="color: gray; font-style: italic; margin-right: 10px;">Turno ${estadoActual}</span>`;
                    }
                    

                    const clienteSeguro = (t.cliente_nombre || t.cliente || '-').replace(/'/g, "\\'");
                    const servicioSeguro = (t.servicio_nombre || t.servicio || '-').replace(/'/g, "\\'");
                    botonesAccion += `
                        <button class="btn-primary" style="background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" 
                            onclick="generarPDFTurno(${t.id}, '${clienteSeguro}', '${servicioSeguro}', '${fechaFormateada}', '${estadoActual}')">
                            Descargar PDF
                        </button>
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
    } catch (error) {
        console.error("Error de conexión:", error); // DEBUG
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
        turnos(); 
        
    } catch (error) {
        console.error(error);
    }   
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

