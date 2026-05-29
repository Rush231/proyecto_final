async function cargarProfesionales() {
    const negocioId = localStorage.getItem("negocio_id");

    try {
        const response = await fetch(`${apiURL}/profesionales/${negocioId}`);
        const profesionales = await handleResponse(response);
        
        const tbody = document.querySelector('#profesionales .data-table tbody');
        tbody.innerHTML = '';

        profesionales.forEach(prof => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prof.nombre} ${prof.apellido}</td>
                <td>${prof.especialidad}</td>
                <td><button onclick="eliminarProfesional(${prof.id})">Eliminar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar profesionales", error);
    }
}