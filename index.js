const express = require("express");
const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const deepseekChat = require("./src/routes/deepseekChat");
const deepseekDiet = require("./src/routes/deepseekDiet");
const recipeService = require("./src/services/recipeService");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const cors = require("cors");
require("dotenv").config();

// Configuración inicial
const PORT = process.env.PORT || 5000;
const app = express();

// ✅ CORS correcto
app.use(
  cors({
    origin: "http://localhost:3000", // Cambia esto si estás en producción
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Express básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rutas bien separadas
app.use("/api/auth", authRoutes);
app.use("/api/ai/chat", deepseekChat);
app.use("/api/ai/diet", deepseekDiet);
app.use("/api/recipes", recipeRoutes);
app.use("/api/user", userRoutes);

// ✅ Ruta de salud
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err.stack);
  res.status(500).json({
    success: false,
    error: "Ocurrió un error interno en el servidor",
  });
});

// ✅ Inicialización del servidor
const startServer = async () => {
  try {
    const db = await connectDB();

    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Colecciones disponibles:",
      collections.map((c) => c.name)
    );

    const recipeCollection = db.collection("recipes");
    recipeService.setCollection(recipeCollection);
    console.log("✅ Recipe collection configurada correctamente");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📚 Endpoints disponibles:`);
      console.log(`- POST /api/auth/register`);
      console.log(`- POST /api/auth/login`);
      console.log(`- GET /api/user/me`);
      console.log(`- PUT /api/user/me`);
      console.log(`- DELETE /api/user/me`);
      console.log(`- GET /api/recipes/my-recipes`); // <-- ruta agregada correctamente
      console.log(`- GET /api/recipes`);
      console.log(`- POST /api/recipes`);
      console.log(`- PUT /api/recipes/:id`);
      console.log(`- DELETE /api/recipes/:id`);
      console.log(`- POST /api/ai/chat`);
      console.log(`- POST /api/ai/diet`);
      console.log(`- GET /health`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
