document.addEventListener("DOMContentLoaded", () => {
    // Limpiar datos de sesiones anteriores
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    localStorage.removeItem("rol");
    localStorage.removeItem("negocio_id");


    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            userLogin();
        });
    }
});

function userLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const messageElement = document.getElementById("message");
    const submitBtn = document.getElementById('login-btn');
    const spinner = document.getElementById('loading-spinner');

    messageElement.classList.remove('error', 'success');

    if (!username || !password) {
        messageElement.innerHTML = "Por favor, complete ambos campos.";
        messageElement.classList.add('error');
        return;
    }

    messageElement.innerHTML = "Iniciando sesión...";
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Configuración de credenciales HTTP Basic Auth
    const credentials = btoa(`${username}:${password}`);
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${credentials}`
        }
    };

    fetch(apiURL + '/login', requestOptions)
        .then(response => handleResponse(response))
        .then(response => {
            if (response.token) {
                // Almacenar datos persistentes del tenant en el navegador
                localStorage.setItem("token", response.token);
                localStorage.setItem("username", response.username || response.name); 
                localStorage.setItem("id", response.id);
                localStorage.setItem("rol", response.rol); 
                localStorage.setItem("negocio_id", response.negocio_id);

                
                window.location.href = "dashboard.html";
            } else {
                messageElement.innerHTML = response.message || "Error al iniciar sesión.";
                messageElement.classList.add('error');
            }
        })
        .catch(error => {
            if (error.message === "Failed to fetch") {
                messageElement.innerHTML = "No se pudo conectar con el servidor. Verifique su conexión.";
            } else {
                messageElement.innerHTML = error.error || "Error al iniciar sesión";
            }
            messageElement.classList.add('error');
        })
        .finally(() => {
            // Restablecer interfaz del botón
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        });
}