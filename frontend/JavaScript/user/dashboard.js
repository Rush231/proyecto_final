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
            if (targetSection) {
                targetSection.classList.remove('hidden');
                targetSection.classList.add('active');
            }
            
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

        // --- INICIO DEL NUEVO GRÁFICO POR DÍA ---
        
        // 1. Agrupar la cantidad de turnos por fecha
        const turnosPorDia = {};
        turnos.forEach(t => {
            if (t.fecha_hora && t.fecha_hora !== 'Sin fecha') {
                // t.fecha_hora viene como "15/06/2026 14:30". Cortamos por el espacio para tomar solo "15/06/2026"
                const fecha = t.fecha_hora.split(' ')[0]; 
                turnosPorDia[fecha] = (turnosPorDia[fecha] || 0) + 1;
            }
        });

        // 2. Ordenar las fechas cronológicamente
        const fechasOrdenadas = Object.keys(turnosPorDia).sort((a, b) => {
            const [diaA, mesA, anioA] = a.split('/');
            const [diaB, mesB, anioB] = b.split('/');
            return new Date(anioA, mesA - 1, diaA) - new Date(anioB, mesB - 1, diaB);
        });

        // 3. Tomar los últimos 7 días (para no saturar el gráfico) y darles formato
        const datosGrafico = fechasOrdenadas.slice(-7).map(fecha => ({
            etiqueta: fecha.substring(0, 5), // Corta "15/06/2026" para que en el gráfico solo diga "15/06"
            valor: turnosPorDia[fecha]
        }));

        // 4. Llamar a la función que dibuja el canvas
        dibujarGraficoPorDia(datosGrafico);
        
        // --- FIN DEL NUEVO GRÁFICO ---

        const agrupado = {};

        turnos.forEach(t => {
            let clave = "Desconocido";
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

function renderizarServiciosComoTags(servicios) {
    const contenedor = document.getElementById('contenedor-servicios-tags');
    if (!contenedor) return; 
    
    contenedor.innerHTML = ''; 

    servicios.forEach(s => {
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

function dibujarGraficoPorDia(datos) {
    const canvas = document.getElementById('graficoTurnos');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    //  Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si no hay datos, mostrar un mensaje en el canvas
    if (datos.length === 0) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No hay turnos registrados', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Cálculos para que las barras se adapten solas al ancho (500px)
    const maxValor = Math.max(...datos.map(d => d.valor), 1);
    const margen = 40; // Espacio a los costados
    const espacioDisponible = canvas.width - (margen * 2);
    
    // Ancho dinámico dependiendo de cuántos días se muestren (máximo 60px)
    const anchoBarra = Math.min(60, (espacioDisponible / datos.length) - 10); 
    // Espacio entre barras
    const separacion = datos.length > 1 ? (espacioDisponible - (anchoBarra * datos.length)) / (datos.length - 1) : 0;
    
    const altoMaximoBarra = 150; 
    let x = margen; // X inicial

    datos.forEach(dato => {
        const alturaBarra = (dato.valor / maxValor) * altoMaximoBarra; 
        const y = canvas.height - alturaBarra - 30;

        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x, y, anchoBarra, alturaBarra);

        
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dato.valor, x + (anchoBarra / 2), y - 10);


        ctx.fillStyle = '#7f8c8d';
        ctx.font = '14px Arial';
        ctx.fillText(dato.etiqueta, x + (anchoBarra / 2), canvas.height - 10);

        x += anchoBarra + separacion; // Mover a la derecha para la próxima barra
    });
}