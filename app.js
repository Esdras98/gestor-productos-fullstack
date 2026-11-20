
const express = require("express");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Autenticación
app.use("/api/auth", authRoutes);

// CRUD de productos
app.use("/api/productos", productRoutes);

// Comprobar servidor
app.get("/api/health", (req, res) => {
  res.json({
    mensaje: "Servidor funcionando correctamente"
  });
});

// Diagnóstico
app.get("/api/diagnostico", (req, res) => {
  res.json({
    mensaje: "Aplicación actualizada y funcionando"
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada",
    ruta: req.originalUrl,
    metodo: req.method
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError" ||
      err.name === "CastError") {
    return res.status(400).json({
      mensaje: "Datos inválidos"
    });
  }

  res.status(500).json({
    mensaje: "Error interno del servidor"
  });
});

module.exports = app;
