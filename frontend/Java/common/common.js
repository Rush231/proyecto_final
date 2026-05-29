
function handleResponse(response) {
    if (!response.ok) {
        
        return response.json().then(info => {
            return Promise.reject(info); 
        })
    } else {
        
        return response.json();
    }
}