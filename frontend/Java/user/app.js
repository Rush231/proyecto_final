const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('`${apiURL}/api/login`', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
        
            console.log("Ingreso exitoso");
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('app-view').classList.remove('hidden');
            
          
            cargarClientes();
        } else {
            // Mostrar error del servidor (ej. credenciales incorrectas)
            alert(data.mensaje || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
    }
});


