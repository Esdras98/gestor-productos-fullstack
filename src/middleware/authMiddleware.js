const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Acceso denegado. Token requerido"
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (!decoded.sub) {
      return res.status(401).json({
        mensaje: "Token inválido"
      });
    }

    req.userId = decoded.sub;
    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado"
    });
  }
};

module.exports = authMiddleware;