document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificación de seguridad
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // 2. Navegación del menú
    const navLinks = document.querySelectorAll('#nav-links a');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // Ocultar todas las secciones
            contentSections.forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            // Mostrar la seleccionada
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

    // 3. Cierre de sesión
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    // 4. Lógica de filtro para reportes
    const filtroReporte = document.getElementById('filtro-reporte');
    if(filtroReporte) {
        filtroReporte.addEventListener('change', (e) => {
            cargarReportes(e.target.value);
        });
    }

    // Cargar reportes al iniciar por primera vez
    cargarReportes('profesional');
});

// Función central para manejar la analítica
async function cargarReportes(criterio = 'profesional') {
    const negocioId = localStorage.getItem("negocio_id");
    
    // Aquí es donde posteriormente harás el fetch a tu backend
    // Ejemplo: const response = await fetch(`${apiURL}/reportes/${negocioId}?agrupar=${criterio}`);
    
    // Por ahora, limpiamos la tabla para prepararla
    const tbody = document.querySelector('#tabla-reportes tbody');
    if(tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Cargando datos por ${criterio}...</td></tr>`;
}