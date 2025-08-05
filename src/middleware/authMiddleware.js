const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  console.log("🔐 AuthMiddleware - Verificando autenticación...");
  console.log("📍 URL:", req.originalUrl);
  console.log("🔧 Método:", req.method);

  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("🎫 Token recibido:", token ? "SÍ" : "NO");

  if (!token) {
    console.log("❌ Token no proporcionado");
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verificado exitosamente:", decoded);
    req.user = { id: decoded.id }; // Estructura consistente
    next();
  } catch (error) {
    console.error("❌ Error al verificar token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
