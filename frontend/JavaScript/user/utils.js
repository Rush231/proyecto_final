
const apiURL = "http://127.0.0.1:5000";

function handleResponse(response) {
    if (!response.ok) {
        return response.json().then(errorData => {
            throw new Error(errorData.error || "Error en el servidor");
        });
    }
    return response.json();
}