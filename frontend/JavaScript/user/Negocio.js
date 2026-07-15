function cargarConfiguracion() {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch(`${apiURL}/negocio/configuracion`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(data => {
        document.getElementById('config-nombre').value = data.nombre || '';
        document.getElementById('config-telefono').value = data.telefono || '';
        if (data.hora_apertura) document.getElementById('config-apertura').value = data.hora_apertura.substring(0,5);
        if (data.hora_cierre) document.getElementById('config-cierre').value = data.hora_cierre.substring(0,5);
    })
    .catch(error => console.error("Error al cargar configuración:", error));
}

function guardarConfiguracion(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const horaApertura = document.getElementById('config-apertura').value;
    const horaCierre = document.getElementById('config-cierre').value;

    if (horaApertura && horaCierre && horaApertura >= horaCierre) {
        alert("Error: La hora de cierre debe ser posterior a la hora de apertura.");
        return;
    }

    const datos = {
        nombre: document.getElementById('config-nombre').value,
        telefono: document.getElementById('config-telefono').value,
        hora_apertura: horaApertura,
        hora_cierre: horaCierre
    };

    fetch(`${apiURL}/negocio/configuracion`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    })
    .then(handleResponse)
    .then(() => alert("Configuración actualizada correctamente."))
    .catch(error => {
        console.error("Error al guardar:", error);
        alert("Hubo un error al guardar la configuración.");
    });
}

function inicializarSelectsHorarios() {
    const selects = ['config-apertura', 'config-cierre'];
    
    selects.forEach(id => {
        const selectElement = document.getElementById(id);
        if (!selectElement) return;
        
        selectElement.innerHTML = ''; // Limpiamos opciones previas
        
        // Generamos horarios cada 30 minutos
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m <= 30; m += 30) {

                const hora24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                
                
                const ampm = h >= 12 ? 'PM' : 'AM';
                let hora12 = h % 12;
                hora12 = hora12 ? hora12 : 12; // Si es 0, mostramos 12
                const textoVisible = `${hora12}:${m.toString().padStart(2, '0')} ${ampm}`;
                
                
                const option = document.createElement('option');
                option.value = hora24;
                option.textContent = textoVisible;
                selectElement.appendChild(option);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarSelectsHorarios();

    const navLinks = document.querySelectorAll('#nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.getAttribute('data-target') === 'configuracion') {
                cargarConfiguracion();
            }
        });
    });
});