const jwt = require("jsonwebtoken");

const publicRoutes = [
  { method: "GET", path: "/api/recipes", exact: true },
  { method: "GET", path: "/api/recipes/search-suggestions", exact: false },
];

const authMiddleware = async (req, res, next) => {
  console.log("🔐 AuthMiddleware - Verificando autenticación...");
  console.log("📍 URL:", req.originalUrl);
  console.log("🔧 Método:", req.method);
  
  const isPublic = publicRoutes.some(
    (route) => {
      if (route.exact) {
        const isMatch = route.method === req.method && req.originalUrl === route.path;
        console.log(`🔍 Comparando exacto: ${route.method} ${route.path} vs ${req.method} ${req.originalUrl} = ${isMatch}`);
        return isMatch;
      } else {
        const isMatch = route.method === req.method && req.originalUrl.startsWith(route.path);
        console.log(`🔍 Comparando prefijo: ${route.method} ${route.path} vs ${req.method} ${req.originalUrl} = ${isMatch}`);
        return isMatch;
      }
    }
  );

  console.log(`🔑 Es ruta pública: ${isPublic}`);

  if (isPublic) {
    console.log("✅ Ruta pública, pasando sin autenticación");
    return next();
  }

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
