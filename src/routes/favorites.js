const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

console.log("🔗 Cargando rutas de favoritos...");

// Rutas que requieren autenticación obligatoria
router.post("/", authMiddleware, favoritesController.addToFavorites);
router.delete("/:recipeId", authMiddleware, favoritesController.removeFromFavorites);
router.get("/", authMiddleware, favoritesController.getFavorites);

// Ruta para verificar favorito - autenticación opcional
router.get("/check/:recipeId", optionalAuthMiddleware, favoritesController.checkIfFavorite);

console.log("✅ Rutas de favoritos configuradas");

module.exports = router;
