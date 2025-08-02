const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  // Obtener token del header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
