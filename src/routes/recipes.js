const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes (no authentication required)
router.get("/", optionalAuthMiddleware, recipeController.getRecipes);
router.get("/categories", recipeController.getCategories);
router.get("/search-suggestions", optionalAuthMiddleware, recipeController.getSearchSuggestions);

// Protected routes (authentication required)
router.get("/my-recipes", authMiddleware, recipeController.getMyRecipes);

// This route must be last among GET routes because it uses a parameter
router.get("/:id", optionalAuthMiddleware, recipeController.getRecipeById);
router.post("/", authMiddleware, upload.single("image"), recipeController.createRecipe);
router.put("/:id", authMiddleware, upload.single("image"), recipeController.updateRecipe);
router.delete("/:id", authMiddleware, recipeController.deleteRecipe);

module.exports = router;
