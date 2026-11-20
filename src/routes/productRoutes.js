
const express = require("express");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

const validar = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: errores.array()
    });
  }

  next();
};

const reglasProducto = [
  body("nombre").isString().trim().notEmpty(),
  body("precio").isFloat({ min: 0 }),
  body("stock").isInt({ min: 0 }),
  body("descripcion").optional().isString()
];

const validarId = param("id").isMongoId();

// Proteger todas las rutas
router.use(authMiddleware);

// Crear producto
router.post(
  "/",
  reglasProducto,
  validar,
  productController.crearProducto
);

// Consultar todos
router.get("/", productController.obtenerProductos);

// Consultar por ID
router.get(
  "/:id",
  validarId,
  validar,
  productController.obtenerProducto
);

// Actualizar producto
router.put(
  "/:id",
  validarId,
  reglasProducto,
  validar,
  productController.actualizarProducto
);

// Eliminar producto
router.delete(
  "/:id",
  validarId,
  validar,
  productController.eliminarProducto
);

module.exports = router;
