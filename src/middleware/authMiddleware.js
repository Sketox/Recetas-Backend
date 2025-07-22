const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  // Permitir GET sin autenticación
  if (req.method === "GET") {
    return next();
  }

  // Obtener token del header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
