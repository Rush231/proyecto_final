const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Enviar petición POST a la ruta correspondiente de la API
        const response = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Si el backend valida al usuario, guardar el token (si aplica) y mostrar el panel
            console.log("Ingreso exitoso");
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('app-view').classList.remove('hidden');
            
            // Aquí puedes llamar a otras funciones para cargar los datos del sistema
            cargarClientes();
        } else {
            // Mostrar error del servidor (ej. credenciales incorrectas)
            alert(data.mensaje || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
    }
});


