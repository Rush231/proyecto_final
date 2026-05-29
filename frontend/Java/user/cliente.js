async function cargarClientes() {
    const token = localStorage.getItem("token");

    try {
        // La URL ya no necesita el negocio_id al final
        const response = await fetch(`${apiURL}/clientes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // <-- Aquí se envía el JWT
                'Content-Type': 'application/json'
            }
        });
        
        const clientes = await handleResponse(response);
        const tbody = document.querySelector('#tabla-clientes-body');
        tbody.innerHTML = ''; 

        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.nombre} ${cliente.apellido}</td>
                <td>${cliente.telefono}</td>
                <td><button onclick="eliminarCliente(${cliente.id})">Eliminar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar clientes", error);
        // Si el token expiró, redirigir al login
        if(error.error && error.error.includes("expirado")) {
            window.location.href = "login.html";
        }
    }
}

// Registrar un nuevo cliente
async function crearCliente(event) {
    event.preventDefault();
    const negocioId = localStorage.getItem("negocio_id");
    
    const datos = {
        nombre: document.getElementById('cliente-nombre').value,
        apellido: document.getElementById('cliente-apellido').value,
        telefono: document.getElementById('cliente-telefono').value,
        negocio_id: negocioId
    };

    try {
        const response = await fetch(`${apiURL}/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        await handleResponse(response);
        cargarClientes(); // Recargar la tabla
    } catch (error) {
        console.error("Error al crear cliente", error);
    }
}

// Eliminar un cliente
async function eliminarCliente(id) {
    try {
        const response = await fetch(`${apiURL}/eliminar/${id}`, {
            method: 'DELETE'
        });
        await handleResponse(response);
        cargarClientes(); 
    } catch (error) {
        console.error("Error al eliminar cliente", error);
    }
}