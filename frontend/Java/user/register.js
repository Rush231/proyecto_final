function userRegister(){
    // Obtener los valores ingresados en el formulario
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;


    const messageElement = document.getElementById("message");
    messageElement.classList.remove('error', 'success');


    const submitBtn = document.getElementById('register-btn');
    const spinner = document.getElementById('loading-spinner');


    if (!name || !password || !email) {
        messageElement.innerHTML = "Por favor, complete ambos campos.";
        messageElement.classList.add('error');
        return;
    }

    
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
           
            if (error.message === "Failed to fetch") {
                messageElement.innerHTML = "No se pudo conectar con el servidor.";
            } else {
               
                messageElement.innerHTML = error.error || error.message || "Error al crear el usuario";
            }
            messageElement.classList.add('error');
            
            // Reactivar botón inmediatamente si hubo error
            submitBtn.disabled = false;
            if(spinner) spinner.style.display = 'none';
        });

        // En tu register.js, el objeto debe tener la misma llave que el backend espera
    const datos = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    nombre_de_negocio: document.getElementById('negocio_input').value // ¡Esto es lo que falta!
};
}