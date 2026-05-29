async function cargarProfesionales() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${apiURL}/profesionales`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const profesionales = await handleResponse(response);
        
        const tbody = document.querySelector('#profesionales .data-table tbody');
        if(tbody) tbody.innerHTML = '';

        profesionales.forEach(prof => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prof.nombre || prof.name}</td>
                <td>${prof.especialidad || 'General'}</td>
                <td>--</td>
                <td><button class="btn-secondary" onclick="eliminarProfesional(${prof.id})">Eliminar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar profesionales", error);
    }
}