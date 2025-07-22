const express = require("express");
const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const deepseekChat = require("./src/routes/deepseekChat");
const deepseekDiet = require("./src/routes/deepseekDiet");
const recipeService = require("./src/services/recipeService");
const authRoutes = require("./src/routes/auth");
require("dotenv").config();

// Configuración inicial
const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS (ajusta según tus necesidades)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Rutas principales
app.use("/api/auth", authRoutes); // Rutas de autenticación (públicas)
app.use("/api/ai/", deepseekChat); // Rutas de IA
app.use("/api/ai/", deepseekDiet);
app.use("/api/recipes", recipeRoutes); // Rutas de recetas (protegidas)

// Ruta de verificación de salud
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err.stack);
  res.status(500).json({
    success: false,
    error: "Ocurrió un error interno en el servidor",
  });
});

// Inicialización del servidor
const startServer = async () => {
  try {
    const db = await connectDB();

    // Prueba adicional: listar colecciones
    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Colecciones disponibles:",
      collections.map((c) => c.name)
    );

    const recipeCollection = db.collection("recipes");
    recipeService.setCollection(recipeCollection);
    console.log("✅ Recipe collection configurada correctamente");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📚 Endpoints disponibles:`);
      console.log(`- POST /api/auth/register - Registrar usuario`);
      console.log(`- POST /api/auth/login - Iniciar sesión`);
      console.log(`- GET /api/recipes - Obtener recetas (protegido)`);
      console.log(`- POST /api/recipes - Crear receta (protegido)`);
      console.log(`- PUT /api/recipes/:id - Actualizar receta (protegido)`);
      console.log(`- DELETE /api/recipes/:id - Eliminar receta (protegido)`);
      console.log(`- POST /api/ai/chat - Chat con el chef`);
      console.log(`- POST /api/ai/diet - Plan de dieta personalizado`);
      console.log(`- GET /health - Verificar estado del servidor`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();
