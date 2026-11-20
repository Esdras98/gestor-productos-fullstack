console.log("PRODUCTOS.JS SE EJECUTÓ CORRECTAMENTE");

const token = sessionStorage.getItem("token");

const formulario = document.getElementById("productoForm");
const lista = document.getElementById("listaProductos");
const mensaje = document.getElementById("mensajeProducto");
const titulo = document.getElementById("tituloFormulario");
const cancelar = document.getElementById("cancelarEdicion");

let productoEditando = null;

// Proteger el panel
if (!token) {
  window.location.replace("/");
}

// Realizar solicitudes autenticadas
async function apiProductos(ruta = "", opciones = {}) {
  const respuesta = await fetch("/api/productos" + ruta, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("token"),
      ...opciones.headers
    }
  });

  const datos = await respuesta.json();

  if (respuesta.status === 401) {
    sessionStorage.removeItem("token");
    window.location.replace("/");
    throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  }

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error en la solicitud");
  }

  return datos;
}

// Mostrar un producto
function mostrarProducto(producto) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "producto-card";

  const informacion = document.createElement("div");

  const nombre = document.createElement("h3");
  nombre.textContent = producto.nombre;

  const descripcion = document.createElement("p");
  descripcion.textContent = producto.descripcion || "Sin descripción";

  const precio = document.createElement("p");
  precio.textContent = "Precio: " +
    Number(producto.precio).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN"
    });

  const stock = document.createElement("p");
  stock.textContent = "Stock: " + producto.stock;

  informacion.append(nombre, descripcion, precio, stock);

  const acciones = document.createElement("div");
  acciones.className = "acciones";

  const botonEditar = document.createElement("button");
  botonEditar.textContent = "Editar";
  botonEditar.className = "btn-editar";
  botonEditar.addEventListener("click", () => editarProducto(producto));

  const botonEliminar = document.createElement("button");
  botonEliminar.textContent = "Eliminar";
  botonEliminar.className = "btn-eliminar";
  botonEliminar.addEventListener("click", () => eliminarProducto(producto._id));

  acciones.append(botonEditar, botonEliminar);
  tarjeta.append(informacion, acciones);

  lista.appendChild(tarjeta);
}

// Consultar productos
async function cargarProductos() {
  try {
    const productos = await apiProductos();

    lista.replaceChildren();

    if (productos.length === 0) {
      const vacio = document.createElement("p");
      vacio.textContent = "Todavía no tienes productos registrados.";
      lista.appendChild(vacio);
      return;
    }

    productos.forEach(mostrarProducto);
  } catch (error) {
    mensaje.textContent = error.message;
  }
}

// Guardar o actualizar producto
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),
    precio: Number(document.getElementById("precio").value),
    stock: Number(document.getElementById("stock").value)
  };

  const editando = productoEditando !== null;

  try {
    await apiProductos(editando ? "/" + productoEditando : "", {
      method: editando ? "PUT" : "POST",
      body: JSON.stringify(producto)
    });

    limpiarFormulario();

    mensaje.textContent = editando
      ? "Producto actualizado correctamente"
      : "Producto creado correctamente";

    await cargarProductos();
  } catch (error) {
    mensaje.textContent = error.message;
  }
});

// Seleccionar producto para editar
function editarProducto(producto) {
  productoEditando = producto._id;

  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("descripcion").value = producto.descripcion || "";
  document.getElementById("precio").value = producto.precio;
  document.getElementById("stock").value = producto.stock;

  titulo.textContent = "Editar producto";
  document.getElementById("guardarProducto").textContent = "Actualizar producto";
  cancelar.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Eliminar producto
async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este producto?");

  if (!confirmar) return;

  try {
    await apiProductos("/" + id, {
      method: "DELETE"
    });

    if (productoEditando === id) {
      limpiarFormulario();
    }

    mensaje.textContent = "Producto eliminado correctamente";
    await cargarProductos();
  } catch (error) {
    mensaje.textContent = error.message;
  }
}

// Limpiar formulario
function limpiarFormulario() {
  formulario.reset();
  productoEditando = null;
  titulo.textContent = "Agregar producto";
  document.getElementById("guardarProducto").textContent = "Guardar producto";
  cancelar.hidden = true;
}

cancelar.addEventListener("click", limpiarFormulario);

// Cerrar sesión
document.getElementById("cerrarSesion").addEventListener("click", () => {
  sessionStorage.removeItem("token");
  window.location.replace("/");
});

// Cargar los productos al entrar
if (token) {
  cargarProductos();
}
