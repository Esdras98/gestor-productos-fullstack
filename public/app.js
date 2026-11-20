
const loginForm = document.getElementById("loginForm");
const registroForm = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

// Iniciar sesión
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al iniciar sesión");
    }

    sessionStorage.setItem("token", data.token);
    mensaje.textContent = "Inicio de sesión exitoso";

    window.location.href = "/productos.html";

  } catch (error) {
    mensaje.textContent = error.message;
  }
});

// Registrar usuario
registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreRegistro").value;
  const email = document.getElementById("emailRegistro").value;
  const password = document.getElementById("passwordRegistro").value;

  try {
    const response = await fetch("/api/auth/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al registrarse");
    }

    mensaje.textContent =
      "Usuario registrado. Ahora inicia sesión.";

    registroForm.reset();

  } catch (error) {
    mensaje.textContent = error.message;
  }
});
