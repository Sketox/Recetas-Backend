// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const deepseekChat = require("./src/routes/deepseekChat"); // asegúrate del nombre del archivo
const deepseekDiet = require("./src/routes/deepseekDiet");
const recipeService = require("./src/services/recipeService");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const favoritesRoutes = require("./src/routes/favorites");

const PORT = process.env.PORT || 5000;
const app = express();

/* ---------- CORS (antes de todo) ---------- */
const allowList = new Set([
  "http://localhost:3000",
  "http://192.168.56.1:3000",
  "https://current-ant-touching.ngrok-free.app",
  "https://cooksy-beta.vercel.app",
]);
const vercelRegex = /\.vercel\.app$/i;
const ngrokRegex = /\.ngrok(-free)?\.app$/i;

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Insomnia/Postman
    if (
      allowList.has(origin) ||
      vercelRegex.test(origin) ||
      ngrokRegex.test(origin)
    ) {
      return cb(null, true);
    }
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
  ],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // preflight para cualquier ruta

/* ---------- Parsers ---------- */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------- Debug opcional ---------- */
app.use((req, _res, next) => {
  if (req.method === "POST" && req.url.includes("/recipes")) {
    console.log("🔍 POST /recipes", {
      origin: req.headers.origin,
      body: req.body,
    });
  }
  next();
});

/* ---------- Rutas ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/ai/chat", deepseekChat);
app.use("/api/ai/diet", deepseekDiet);
app.use("/api/recipes", recipeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/favorites", favoritesRoutes);

app.get("/api/debug/routes", (_req, res) => {
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
      "GET /api/favorites/check/:recipeId",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy", ts: new Date().toISOString() });
});

/* ---------- Inicio del servidor ---------- */
(async () => {
  try {
    const db = await connectDB();

    const collections = (await db.listCollections().toArray()).map(
      (c) => c.name
    );
    console.log("📚 Colecciones:", collections);

    recipeService.setCollection(db.collection("recipes"));
    recipeService.setUserCollection(db.collection("users"));
    console.log("✅ Recipe & User collections configuradas");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(
        "✅ CORS listo (localhost, LAN, *.ngrok-free.app, *.vercel.app)"
      );
    });

    // Evita aborts por timeouts cortos
    server.headersTimeout = 120_000;
    server.requestTimeout = 120_000;
  } catch (err) {
    console.error("Error al iniciar el servidor:", err);
    process.exit(1);
  }
})();
