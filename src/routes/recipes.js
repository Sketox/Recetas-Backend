const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware");

// Aplicar middleware a todas las rutas
router.use(authMiddleware);

router.get("/", recipeController.getRecipes);
router.post("/", recipeController.createRecipe);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;
