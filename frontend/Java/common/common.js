const apiURL = "http://127.0.0.1:5000";

function handleResponse(response) {
    if (!response.ok) {
        // Rechaza la promesa con la información de la API
        return response.json().then(info => {
            return Promise.reject(info); 
        })
    } else {
        // Devuelve el cuerpo de la respuesta en formato JSON
        return response.json();
    }
}