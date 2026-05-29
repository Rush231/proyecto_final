document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificación de seguridad
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
            
            // Llamar funciones de carga de datos según la sección
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
    const negocioId = localStorage.getItem("negocio_id");
    
    const tbody = document.querySelector('#tabla-reportes tbody');
    if(tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Cargando datos por ${criterio}...</td></tr>`;

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
});