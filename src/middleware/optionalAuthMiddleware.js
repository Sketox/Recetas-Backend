const jwt = require("jsonwebtoken");

// Middleware de autenticación opcional - no falla si no hay token
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No hay token, pero permitir continuar
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Estructura consistente
    console.log("✅ Usuario autenticado:", decoded.id);
  } catch (error) {
    console.log("⚠️ Token inválido o expirado");
    req.user = null;
  }

  next();
};

module.exports = optionalAuthMiddleware;
