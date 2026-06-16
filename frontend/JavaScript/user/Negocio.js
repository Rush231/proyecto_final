
async function cargarConfiguracion() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${apiURL}/negocio/configuracion`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await handleResponse(response);
        

        document.getElementById('config-nombre').value = data.nombre || '';
        document.getElementById('config-telefono').value = data.telefono || '';
        
        document.getElementById('config-apertura').value = data.hora_apertura ? data.hora_apertura.substring(0,5) : '';
        document.getElementById('config-cierre').value = data.hora_cierre ? data.hora_cierre.substring(0,5) : '';
        
    } catch (error) {
        console.error("Error al cargar configuración:", error);
    }
}

async function guardarConfiguracion(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const datos = {
        nombre: document.getElementById('config-nombre').value,
        telefono: document.getElementById('config-telefono').value,
        hora_apertura: document.getElementById('config-apertura').value,
        hora_cierre: document.getElementById('config-cierre').value
    };

    try {
        const response = await fetch(`${apiURL}/negocio/configuracion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });
        
        await handleResponse(response);
        alert("Configuración actualizada correctamente.");
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al guardar la configuración.");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.getAttribute('data-target') === 'configuracion') {
                cargarConfiguracion();
            }
        });
    });
});