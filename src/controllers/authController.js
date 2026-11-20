
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registrar usuario
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password ||
        typeof nombre !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 8) {
      return res.status(400).json({
        mensaje: "Datos de registro inválidos"
      });
    }

    const correo = email.trim().toLowerCase();

    const usuarioExistente = await User.findOne({
      email: correo
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: "El correo ya está registrado"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      nombre: nombre.trim(),
      email: correo,
      password: passwordHash
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente"
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: "El correo ya está registrado"
      });
    }

    res.status(500).json({
      mensaje: "Error al registrar usuario"
    });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" ||
        typeof password !== "string") {
      return res.status(400).json({
        mensaje: "Correo y contraseña requeridos"
      });
    }

    const usuario = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    const passwordCorrecto = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecto) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    const token = jwt.sign(
      { sub: usuario._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "2h", algorithm: "HS256" }
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión"
    });
  }
};
