
function mostrarFormularioCliente() {
    document.getElementById('cliente-id').value = ''; 
    document.getElementById('form-cliente-titulo').innerText = "Registrar Cliente";
    document.getElementById('form-cliente-container').classList.remove('hidden');
}


function abrirEditarCliente(id, nombre, correo, telefono) {
    document.getElementById('cliente-id').value = id; // Guardamos el ID en el input oculto
    document.getElementById('cliente-nombre').value = nombre;
    document.getElementById('cliente-correo').value = correo === '-' ? '' : correo;
    document.getElementById('cliente-telefono').value = telefono === '-' ? '' : telefono;
    
    document.getElementById('form-cliente-titulo').innerText = "Editar Cliente";
    document.getElementById('form-cliente-container').classList.remove('hidden');
}

function cerrarFormularioCliente() {
    document.getElementById('form-cliente-container').classList.add('hidden');
    document.getElementById('form-crear-cliente').reset();
}

async function guardarCliente(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    
    const id = document.getElementById('cliente-id').value; // Leemos el campo oculto
    
    const datos = {
        nombre: document.getElementById('cliente-nombre').value,
        correo: document.getElementById('cliente-correo').value,
        telefono: document.getElementById('cliente-telefono').value
    };

    // Si el ID tiene número significa que estamos EDITANDO (PUT), si está vacío estamos CREANDO (POST)
    const url = id ? `${apiURL}/Cliente/${id}` : `${apiURL}/cliente`;
    const metodo = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(datos)
        });
        
        await handleResponse(response);
        
        cargarClientes(); 

        if (typeof cargarDatosFormularioTurno === 'function') {
            cargarDatosFormularioTurno(); 
        }
        cerrarFormularioCliente();
    } catch (error) {
        console.error(`Error al ${metodo === 'PUT' ? 'editar' : 'crear'} cliente:`, error);
    }
}

async function cargarClientes() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${apiURL}/cliente`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientes = await handleResponse(response);
        
        const tbody = document.querySelector('#clientes .data-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            clientes.forEach(c => {
                const nombreSeguro = (c.nombre || c.name).replace(/'/g, "\\'"); // Evita errores con nombres con comillas
                tbody.innerHTML += `
                    <tr>
                        <td>${c.nombre || c.name}</td>
                        <td>${c.correo || '-'}</td>
                        <td>${c.telefono || '-'}</td>
                        <td>
                            <button class="btn-primary" style="padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;" 
                                onclick="abrirEditarCliente(${c.id}, '${nombreSeguro}', '${c.correo || '-'}', '${c.telefono || '-'}')">
                                Editar
                            </button>
                            <button class="btn-danger" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" 
                                onclick="eliminarCliente(${c.id})">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }

}
async function eliminarCliente(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        return;
    }
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${apiURL}/cliente/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            }
        });
        await handleResponse(response);
        cargarClientes(); // Recarga la tabla para que el cliente desaparezca de la vista
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("No se pudo eliminar el cliente.");
    }
}

document.addEventListener('DOMContentLoaded', cargarClientes);