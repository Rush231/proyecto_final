function validarRegistro(email, password) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return false;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return false;
    }

    return true;
}

function userRegister(){

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

    if (!validarRegistro(email, password)) {return;
    }
    
    messageElement.innerHTML = "Registrando su cuenta...";

    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;


    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name , password, email })
    };

    fetch(apiURL + '/usuario', requestOptions)
        .then(response => handleResponse(response))
        .then(response => {
            
            messageElement.innerHTML = "¡Usuario creado con éxito! Redirigiendo...";
            messageElement.classList.add('success');
            
            
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
            
            submitBtn.disabled = false;
            if(spinner) spinner.style.display = 'none';
        });

    const datos = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    nombre_de_negocio: document.getElementById('negocio_input').value // ¡Esto es lo que falta!
};

}