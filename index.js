const express = require("express");
const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const deepseekChat = require("./src/routes/deepseekChat");
const deepseekDiet = require("./src/routes/deepseekDiet");
const recipeService = require("./src/services/recipeService");
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
app.use("/api/recipes", recipeRoutes);
app.use("/api/ai/", deepseekChat);
app.use("/api/ai/", deepseekDiet);

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
    const recipeCollection = db.collection("recipes");

    // Inyectar la colección en el servicio
    recipeService.setCollection(recipeCollection);
    console.log("✅ Recipe collection configurada correctamente");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📚 Endpoints disponibles:`);
      console.log(`- GET /api/recipes - Obtener recetas`);
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
