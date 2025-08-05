const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Aplicar middleware a todas las rutas
router.use(authMiddleware);

router.get("/", recipeController.getRecipes);
router.get("/search-suggestions", recipeController.getSearchSuggestions);
router.get("/my-recipes", recipeController.getMyRecipes);
router.get("/:id", recipeController.getRecipeById);
router.post("/", upload.single("image"), recipeController.createRecipe);
router.put("/:id", upload.single("image"), recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;
