const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Aplicar middleware a todas las rutas
router.use(authMiddleware);

router.get("/", recipeController.getRecipes);
router.get("/my-recipes", recipeController.getMyRecipes);
router.post("/", upload.single("image"), recipeController.createRecipe);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;
