function userRegister(){
    // Obtener los valores ingresados en el formulario
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    // Elemento para mostrar mensajes al usuario
    const messageElement = document.getElementById("message");
    messageElement.classList.remove('error', 'success');

    // Elementos para mostrar una animación de carga sobre el botón del formulario
    const submitBtn = document.getElementById('register-btn');
    const spinner = document.getElementById('loading-spinner');

    // Validación de campos
    if (!name || !password || !email) {
        messageElement.innerHTML = "Por favor, complete ambos campos.";
        messageElement.classList.add('error');
        return;
    }

    // Mostrar un mensaje de carga
    messageElement.innerHTML = "Registrando su cuenta...";
    // Mostrar el spinner y desactivar el botón mientras se procesa la solicitud
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;


    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name , password, email })
    };

    // Realizar la solicitud de creación de usuario
    fetch(apiURL + '/crear_usuario', requestOptions)
        .then(response => handleResponse(response))
        .then(response => {
            // ÉXITO
            messageElement.innerHTML = "¡Usuario creado con éxito! Redirigiendo...";
            messageElement.classList.add('success');
            
            //  Redirección al login después de 1.5 segundos
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        })
        .catch(error => {
            // ERROR
            if (error.message === "Failed to fetch") {
                messageElement.innerHTML = "No se pudo conectar con el servidor.";
            } else {
                // Muestra el mensaje de error específico que viene del backend
                messageElement.innerHTML = error.error || error.message || "Error al crear el usuario";
            }
            messageElement.classList.add('error');
            
            // Reactivar botón inmediatamente si hubo error
            submitBtn.disabled = false;
            if(spinner) spinner.style.display = 'none';
        });
}