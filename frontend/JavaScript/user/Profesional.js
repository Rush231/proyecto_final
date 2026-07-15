
function mostrarFormularioProfesional() {
    document.getElementById('profesional-id').value = ''; 
    document.getElementById('form-profesional-titulo').innerText = "Registrar Profesional";
    document.getElementById('form-crear-profesional').reset();
    document.getElementById('form-profesional-container').classList.remove('hidden');
    cargarCheckboxesServicios(); 
}

function cargarCheckboxesServicios() {
    const token = localStorage.getItem("token");
    // Retornamos el fetch para poder encadenarlo luego en "abrirEditarProfesional"
    return fetch(`${apiURL}/servicio`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(servicios => {
        const contenedor = document.getElementById('contenedor-servicios-checkbox');
        contenedor.innerHTML = '';
        if (servicios.length === 0) {
            contenedor.innerHTML = '<span style="color: gray;">No hay servicios registrados.</span>';
            return;
        }
        servicios.forEach(s => {
            contenedor.innerHTML += `
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: normal;">
                    <input type="checkbox" class="servicio-checkbox" value="${s.id}">
                    ${s.nombre || s.name} (${s.duracion} min)
                </label>
            `;
        });
    })
    .catch(error => {
        console.error("Error cargando servicios:", error);
        document.getElementById('contenedor-servicios-checkbox').innerHTML = '<span style="color: red;">Error.</span>';
    });
}

function abrirEditarProfesional(id, nombre, especialidad, horaInicio, horaFin, dias) {
    document.getElementById('profesional-id').value = id;
    document.getElementById('profesional-nombre').value = nombre;
    document.getElementById('profesional-especialidad').value = especialidad;
    document.getElementById('profesional-hora-inicio').value = horaInicio !== 'null' ? horaInicio : '';
    document.getElementById('profesional-hora-fin').value = horaFin !== 'null' ? horaFin : '';
    document.getElementById('form-profesional-titulo').innerText = "Editar Profesional";
    document.getElementById('form-profesional-container').classList.remove('hidden');
    
    // Encadenamos el then porque necesitamos que los checkboxes existan antes de marcarlos
    cargarCheckboxesServicios().then(() => {
        const mapaDiasInverso = { '1': 'Lun', '2': 'Mar', '3': 'Mié', '4': 'Jue', '5': 'Vie', '6': 'Sáb', '0': 'Dom' };
        const checkboxesDias = document.querySelectorAll('.dia-checkbox');
        checkboxesDias.forEach(cb => {
            const nombreDiaCorto = mapaDiasInverso[cb.value]; 
            cb.checked = dias && dias.includes(nombreDiaCorto);
        });
    });
}
function cerrarFormularioProfesional() {
    document.getElementById('form-profesional-container').classList.add('hidden');
    document.getElementById('form-crear-profesional').reset();
}

function guardarProfesional(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const id = document.getElementById('profesional-id').value;
    const horaInicio = document.getElementById('profesional-hora-inicio').value;
    const horaFin = document.getElementById('profesional-hora-fin').value;
    
    if (horaInicio >= horaFin) {
        alert("Error: La hora de salida debe ser posterior a la hora de entrada.");
        return; 
    }
    
    const checkboxesServicios = document.querySelectorAll('.servicio-checkbox:checked');
    const checkboxesDias = document.querySelectorAll('.dia-checkbox:checked');
    const datos = {
        nombre: document.getElementById('profesional-nombre').value,
        especialidad: document.getElementById('profesional-especialidad').value,
        hora_inicio: horaInicio, 
        hora_fin: horaFin,      
        dias_trabajo: Array.from(checkboxesDias).map(cb => parseInt(cb.value)),
        servicios: Array.from(checkboxesServicios).map(cb => parseInt(cb.value))
    };

    const url = id ? `${apiURL}/profesional/${id}` : `${apiURL}/profesional`;
    const metodo = id ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(handleResponse)
    .then(() => {
        cargarProfesionales();
        if (typeof cargarDatosFormularioTurno === 'function') cargarDatosFormularioTurno();
        cerrarFormularioProfesional();
    })
    .catch(error => {
        console.error("Error al guardar profesional:", error);
        alert("Ocurrió un error en el servidor.");
    });
}

function eliminarProfesional(id) {
    if (!confirm("¿Estás seguro? Se eliminarán también los horarios de este profesional.")) return;
    const token = localStorage.getItem("token");

    fetch(`${apiURL}/profesional/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(() => cargarProfesionales())
    .catch(error => {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el profesional. Asegúrate de que no tenga turnos activos.");
    });
}

function cargarProfesionales() {
    const token = localStorage.getItem("token");

    fetch(`${apiURL}/profesional`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(handleResponse)
    .then(profesionales => {
        const tbody = document.querySelector('#profesionales .data-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            profesionales.forEach(p => {
                const horaInicio = p.hora_inicio ? p.hora_inicio.padStart(8, '0').substring(0, 5) : null;
                const horaFin = p.hora_fin ? p.hora_fin.padStart(8, '0').substring(0, 5) : null;
                const horario = horaInicio && horaFin ? `${horaInicio} a ${horaFin}` : 'Sin horario';
                
                let diasFormateados = p.dias_trabajo ? String(p.dias_trabajo) : '';
                const diccionarioDias = { '0': 'Dom', '1': 'Lun', '2': 'Mar', '3': 'Mié', '4': 'Jue', '5': 'Vie', '6': 'Sáb', '7': 'Dom' };
                
                if (diasFormateados) {
                    diasFormateados = diasFormateados.split(',').map(dia => {
                        let limpio = dia.replace(/['"]/g, '').trim(); 
                        if (diccionarioDias[limpio]) return diccionarioDias[limpio];
                        if (/^[0-7]+$/.test(limpio)) return limpio.split('').map(n => diccionarioDias[n]).join(', ');
                        return limpio;
                    }).join(', ');
                }
                const nombreSeguro = (p.nombre || p.name).replace(/'/g, "\\'");
                tbody.innerHTML += `
                    <tr>
                        <td>${p.nombre || p.name}</td>
                        <td>${p.especialidad || 'General'}</td>
                        <td>
                            <strong>${diasFormateados || 'Sin días'}</strong><br>
                            <span style="color: gray; font-size: 0.9em;">${horario}</span>
                        </td>
                        <td>
                            <button class="btn-primary" style="padding: 5px 10px; margin-right: 5px;" 
                                onclick="abrirEditarProfesional(${p.id}, '${nombreSeguro}', '${p.especialidad}', '${horaInicio}', '${horaFin}', '${diasFormateados}')">Editar</button>
                            <button class="btn-danger" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer;" 
                                onclick="eliminarProfesional(${p.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
        }
    })
    .catch(error => console.error("Error cargando tabla:", error));
}

function inicializarSelectsHorariosProfesional() {
    const selects = ['profesional-hora-inicio', 'profesional-hora-fin'];
    
    selects.forEach(id => {
        const selectElement = document.getElementById(id);
        if (!selectElement) return;
        
        selectElement.innerHTML = ''; // Limpiamos opciones
        
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m <= 30; m += 30) {
                const hora24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const ampm = h >= 12 ? 'PM' : 'AM';
                let hora12 = h % 12;
                hora12 = hora12 ? hora12 : 12;
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
    inicializarSelectsHorariosProfesional(); // Genera los <select>
    cargarProfesionales();
});
