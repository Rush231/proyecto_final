document.addEventListener("DOMContentLoaded", () => {
    
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const navLinks = document.querySelectorAll('#nav-links a');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            
            contentSections.forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            
            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
            
            
            if (targetId === 'clientes' && typeof cargarClientes === 'function') cargarClientes();
            if (targetId === 'servicios' && typeof cargarServicios === 'function') cargarServicios();
            if (targetId === 'turnos' && typeof cargarTurnos === 'function') cargarTurnos();
            if (targetId === 'profesionales' && typeof cargarProfesionales === 'function') cargarProfesionales();
            if (targetId === 'dashboard') cargarReportes();
        });
    });


    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    
    const filtroReporte = document.getElementById('filtro-reporte');
    if(filtroReporte) {
        filtroReporte.addEventListener('change', (e) => {
            cargarReportes(e.target.value);
        });
    }

    
    cargarReportes('profesional');
});


async function cargarReportes(criterio = 'profesional') {
    const token = localStorage.getItem("token");
    const tbody = document.querySelector('#tabla-reportes tbody');
    
    if (!token) return;
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Cargando datos por ${criterio}...</td></tr>`;

    try {
        const response = await fetch(`${apiURL}/turnos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const turnos = await handleResponse(response);


        const totalTurnos = turnos.length;
        const turnosReservados = turnos.filter(t => t.estado === 'Pendiente' || t.estado === 'reservado').length;
        const turnosCompletados = turnos.filter(t => t.estado === 'Completado').length;
        const turnosCancelados = turnos.filter(t => t.estado === 'Cancelado' || t.estado === 'Ausente').length;

        
        const porcentajeOcupacion = totalTurnos === 0 ? 0 : Math.round((turnosReservados / totalTurnos) * 100);


        document.getElementById('rep-ocupacion').innerText = `${porcentajeOcupacion}%`;
        document.getElementById('rep-reservados').innerText = turnosReservados;
        document.getElementById('rep-disponibles').innerText = turnosCompletados;

   
        const agrupado = {};

        turnos.forEach(t => {
            let clave = "Desconocido";
            // Determinar la clave de agrupación según lo que seleccionó el usuario
            if (criterio === 'profesional') {
                clave = t.profesional_nombre || "Profesional " + t.profesional_id;
            } else if (criterio === 'servicio') {
                clave = t.servicio_nombre || "Servicio Desconocido";
            } else if (criterio === 'cliente') {
                clave = t.cliente_nombre || "Cliente Desconocido";
            }

            if (!agrupado[clave]) {
                agrupado[clave] = { total: 0, completados: 0, cancelados: 0 };
            }

            agrupado[clave].total++;
            if (t.estado === 'Completado') agrupado[clave].completados++;
            if (t.estado === 'Cancelado' || t.estado === 'Ausente') agrupado[clave].cancelados++;
        });

        tbody.innerHTML = '';

        if (Object.keys(agrupado).length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay turnos registrados en este local.</td></tr>`;
            return;
        }

        // Iterar sobre el objeto construido y generar el HTML
        for (const [nombre, datos] of Object.entries(agrupado)) {
            tbody.innerHTML += `
                <tr>
                    <td>${nombre}</td>
                    <td>${datos.total}</td>
                    <td>${datos.completados}</td>
                    <td>${datos.cancelados}</td>
                </tr>
            `;
        }

    } catch (error) {
        console.error("Error al cargar reportes:", error);
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Error al cargar los datos.</td></tr>`;
    }
}


    function ocultarTodasLasSecciones() {
        const secciones = document.querySelectorAll('.view-section');
        secciones.forEach(seccion => {
            seccion.classList.add('hidden'); // Les pone a todos el candado de oculto
        });
    }

    document.querySelectorAll('#nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. PRIMERO: Ocultamos todo lo que existe
            ocultarTodasLasSecciones();
            
            // 2. DESPUÉS: Quitamos la clase hidden solo al que queremos ver
            const targetId = e.target.getAttribute('data-target');
            const seccionAMostrar = document.getElementById(targetId);
            
            if (seccionAMostrar) {
                seccionAMostrar.classList.remove('hidden');
            }
        });
    function renderizarServiciosComoTags(servicios) {
        const contenedor = document.getElementById('contenedor-servicios-tags');
        contenedor.innerHTML = ''; 

        servicios.forEach(s => {
            // Creamos un ID único para el checkbox
            const checkboxId = `servicio-${s.id}`;
            
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${s.id}" class="servicio-tag-checkbox">
                <label for="${checkboxId}" class="servicio-tag">
                    ${s.nombre} <small>(${s.duracion} min)</small>
                </label>
            `;
            
            contenedor.appendChild(wrapper.firstElementChild);
            contenedor.appendChild(wrapper.lastElementChild);
        });
    }

    

});