
const Product = require("../models/Product");

// Crear producto
exports.crearProducto = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;

    const producto = await Product.create({
      nombre,
      descripcion,
      precio,
      stock,
      propietario: req.userId
    });

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto
    });
  } catch (error) {
    next(error);
  }
};

// Consultar todos los productos del usuario
exports.obtenerProductos = async (req, res, next) => {
  try {
    const productos = await Product.find({
      propietario: req.userId
    });

    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
};

// Consultar producto por ID
exports.obtenerProducto = async (req, res, next) => {
  try {
    const producto = await Product.findOne({
      _id: req.params.id,
      propietario: req.userId
    });

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
exports.actualizarProducto = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;

    const producto = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        propietario: req.userId
      },
      {
        nombre,
        descripcion: descripcion ?? "",
        precio,
        stock
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Producto actualizado correctamente",
      producto
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto
exports.eliminarProducto = async (req, res, next) => {
  try {
    const producto = await Product.findOneAndDelete({
      _id: req.params.id,
      propietario: req.userId
    });

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Producto eliminado correctamente"
    });
  } catch (error) {
    next(error);
  }
};
