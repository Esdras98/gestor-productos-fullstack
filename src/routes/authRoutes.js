const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Registrar usuario
router.post("/registro", authController.registrar);

// Iniciar sesión
router.post("/login", authController.login);

// Ruta protegida con JWT
router.get("/perfil", authMiddleware, (req, res) => {
  res.status(200).json({
    mensaje: "Ruta protegida funcionando correctamente",
    usuarioId: req.userId
  });
});

module.exports = router;