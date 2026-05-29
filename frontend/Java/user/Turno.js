// Cargar turnos del negocio
async function cargarTurnos() {
    const apiURL = "http://127.0.0.1:5000";
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${apiURL}/turnos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        });
        
        const turnos = await handleResponse(response);
        
        const tbody = document.querySelector('#turnos .data-table tbody');
        if(tbody) tbody.innerHTML = '';

        turnos.forEach(turno => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${turno.fecha_hora}</td>
                <td>${turno.cliente_nombre || turno.cliente_id}</td>
                <td>${turno.servicio_nombre || turno.servicio_id}</td>
                <td>${turno.estado}</td>
                <td><button onclick="cancelarTurno(${turno.id})">Cancelar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar turnos", error);
        if(error.error && error.error.includes("expirado")) {
            window.location.href = "login.html";
        }
    }
}

// Asignar un turno
async function crearTurno(event) {
    event.preventDefault();
    
    const token = localStorage.getItem("token");

    const datos = {
        cliente_id: parseInt(document.getElementById('turno-cliente-id').value),
        profesional_id: parseInt(document.getElementById('turno-profesional-id').value),
        servicio_id: parseInt(document.getElementById('turno-servicio-id').value),
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
        
        await handleResponse(response);
        
        cargarTurnos(); 

        document.getElementById('form-turno-container').classList.add('hidden');
        document.getElementById('form-crear-turno').reset();
    } catch (error) {
        console.error("Error al crear turno", error);
    }
} 

// Mostrar el formulario y cargar los desplegables
function mostrarFormularioTurno() {
    document.getElementById('form-turno-container').classList.remove('hidden');
    cargarOpcionesFormulario();
}

// Cargar listas desplegables dinámicamente
// Cargar listas desplegables dinámicamente
async function cargarOpcionesFormulario() {
    const token = localStorage.getItem("token");
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // 1. Ahora SOLO pedimos Clientes y Profesionales de entrada
        const [resClientes, resProfesionales] = await Promise.all([
            fetch(`${apiURL}/clientes`, { headers }),
            fetch(`${apiURL}/profesionales`, { headers })
        ]);

        const clientes = await handleResponse(resClientes);
        const profesionales = await handleResponse(resProfesionales);

        // -- Llenar select de Clientes --
        const selCliente = document.getElementById('turno-cliente-id');
        selCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(c => {
            selCliente.innerHTML += `<option value="${c.id}">${c.nombre} ${c.apellido || ''}</option>`;
        });

        // -- Llenar select de Profesionales --
        const selProf = document.getElementById('turno-profesional-id');
        selProf.innerHTML = '<option value="">Seleccione un profesional...</option>';
        profesionales.forEach(p => {
            selProf.innerHTML += `<option value="${p.id}">${p.nombre} (${p.especialidad || 'General'})</option>`;
        });

        // -- Dejar el select de Servicios listo pero en espera --
        const selServ = document.getElementById('turno-servicio-id');
        selServ.innerHTML = '<option value="">Primero seleccione un profesional...</option>';
        selServ.disabled = true; // Lo bloqueamos visualmente

        // 2. ESCUCHADOR DE CAMBIOS: Cuando eligen un profesional, buscamos sus servicios
        selProf.addEventListener('change', function() {
            const profesionalId = this.value;
            if (profesionalId) {
                cargarServiciosPorProfesional(profesionalId);
            } else {
                // Si vuelven a la opción vacía, bloqueamos de nuevo
                selServ.innerHTML = '<option value="">Primero seleccione un profesional...</option>';
                selServ.disabled = true;
            }
        });

    } catch (error) {
        console.error("Error cargando opciones del formulario:", error);
    }
}

// 3. NUEVA FUNCIÓN: Busca solo los servicios de UN profesional
async function cargarServiciosPorProfesional(profesionalId) {
    const token = localStorage.getItem("token");
    const selServ = document.getElementById('turno-servicio-id');
    
    // Mostramos que está cargando...
    selServ.innerHTML = '<option value="">Cargando servicios...</option>';
    selServ.disabled = true;

    try {
        // Llamamos a una nueva ruta en tu backend que crearemos en el siguiente paso
        const response = await fetch(`${apiURL}/servicios/profesional/${profesionalId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const servicios = await handleResponse(response);
        
        selServ.innerHTML = '<option value="">Seleccione un servicio...</option>';
        servicios.forEach(s => {
            selServ.innerHTML += `<option value="${s.id}">${s.nombre} - ${s.duracion} min</option>`;
        });
        
        selServ.disabled = false; // Desbloqueamos para que puedan elegir

    } catch (error) {
        console.error("Error al cargar servicios del profesional:", error);
        selServ.innerHTML = '<option value="">Error al cargar servicios</option>';
    }
}