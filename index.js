const express = require("express");
const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const deepseekChat = require("./src/routes/deepseekChat");
const deepseekDiet = require("./src/routes/deepseekDiet");
const recipeService = require("./src/services/recipeService");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const favoritesRoutes = require("./src/routes/favorites");
const cors = require("cors");
require("dotenv").config();

// Configuración inicial
const PORT = process.env.PORT || 5000;
const app = express();

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

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

// 🔍 Middleware de debug para ver qué llega
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url.includes('/recipes')) {
    console.log("🔍 DEBUG - Petición POST a recipes:");
    console.log("- URL:", req.url);
    console.log("- Headers:", req.headers);
    console.log("- Body:", req.body);
    console.log("- Raw body type:", typeof req.body);
  }
  next();
});

// ✅ Rutas bien separadas
app.use("/api/auth", authRoutes);
app.use("/api/ai/chat", deepseekChat);
app.use("/api/ai/diet", deepseekDiet);
app.use("/api/recipes", recipeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/favorites", favoritesRoutes);

// 🔍 Debug endpoint para ver todas las rutas
app.get("/api/debug/routes", (req, res) => {
  res.json({
    message: "Rutas disponibles",
    routes: [
      "POST /api/auth/register",
      "POST /api/auth/login", 
      "GET /api/user/me",
      "GET /api/recipes",
      "POST /api/recipes",
      "GET /api/recipes/my-recipes",
      "POST /api/favorites",
      "DELETE /api/favorites/:recipeId",
      "GET /api/favorites",
      "GET /api/favorites/check/:recipeId"
    ]
  });
});

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
    const userCollection = db.collection("users");
    
    recipeService.setCollection(recipeCollection);
    recipeService.setUserCollection(userCollection);
    console.log("✅ Recipe collection configurada correctamente");
    console.log("✅ User collection configurada correctamente");

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
