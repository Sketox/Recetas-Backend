const jwt = require("jsonwebtoken");

const publicRoutes = [
  { method: "GET", path: "/api/recipes" },
];

const authMiddleware = async (req, res, next) => {
  const isPublic = publicRoutes.some(
    (route) =>
      route.method === req.method &&
      req.originalUrl.startsWith(route.path)
  );

  if (isPublic) {
    return next();
  }

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
