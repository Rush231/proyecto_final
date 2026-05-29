// utils.js
const apiURL = "http://127.0.0.1:5000";

// Esta es la función que Turno.js está buscando y no encuentra
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error en el servidor");
    }
    return response.json();
}