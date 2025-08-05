const RecipeDTO = require("../DTO/dto-recipes.dto");
const recipeService = require("../services/recipeService");
const { ObjectId } = require("mongodb");
const { uploadImage } = require("../utils/cloudinary");
const fs = require("fs");

const createRecipe = async (req, res) => {
  console.log("📝 === CREAR RECETA ===");
  console.log("📝 req.body COMPLETO:", JSON.stringify(req.body, null, 2));
  console.log("📝 req.headers:", req.headers);
  console.log("👤 Usuario autenticado:", req.user);

  const recipeData = {
    ...req.body,
    userId: req.user.id, // Agregar ID de usuario desde el token JWT
  };

  console.log(
    "📦 Datos completos para validar:",
    JSON.stringify(recipeData, null, 2)
  );

  const dto = new RecipeDTO(recipeData);

  if (!dto.isValid()) {
    console.log("❌ Validación fallida del DTO:");
    console.log("- title:", typeof dto.title, dto.title);
    console.log("- description:", typeof dto.description, dto.description);
    console.log(
      "- ingredients:",
      Array.isArray(dto.ingredients),
      dto.ingredients
    );
    console.log(
      "- instructions:",
      Array.isArray(dto.instructions),
      dto.instructions
    );
    console.log("- prepTime:", typeof dto.prepTime, dto.prepTime);
    console.log("- cookTime:", typeof dto.cookTime, dto.cookTime);
    console.log("- servings:", typeof dto.servings, dto.servings);
    console.log("- difficulty:", dto.difficulty);
    console.log("- category:", dto.category);
    console.log("- imageUrl:", typeof dto.imageUrl, dto.imageUrl);
    console.log("- rating:", typeof dto.rating, dto.rating);
    console.log("- userId:", typeof dto.userId, dto.userId);

    return res.status(400).json({
      error: "Invalid recipe data",
      details:
        "Revisa que todos los campos estén completos y sean del tipo correcto",
    });
  }

  try {
    const result = await recipeService.createRecipe(dto);
    console.log("✅ Receta creada exitosamente:", result.insertedId);
    res.status(201).json({
      message: "Recipe created successfully",
      id: result.insertedId,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error in createRecipe:", error);
    res.status(500).json({ error: "Failed to save recipe" });
  }
};

const getRecipes = async (req, res) => {
  try {
    const recipes = await recipeService.getRecipes();
    res.json(recipes);
  } catch (error) {
    console.error("❌ Error in getRecipes:", error);
    res.status(500).json({ error: "Failed to retrieve recipes" });
  }
};

const getMyRecipes = async (req, res) => {
  console.log("📝 Obteniendo recetas del usuario...");
  console.log("🔑 req.user:", req.user);

  // ✅ Validación para evitar errores si no hay usuario autenticado
  if (!req.user || !req.user.id) {
    console.log("❌ Usuario no autenticado en getMyRecipes");
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    console.log("🔍 Buscando recetas para el usuario:", req.user.id);
    const recipes = await recipeService.getRecipesByUser(req.user.id);
    console.log("📦 Recetas encontradas:", recipes.length);
    res.json(recipes);
  } catch (error) {
    console.error("❌ Error in getMyRecipes:", error);
    res.status(500).json({ error: "Failed to retrieve user's recipes" });
  }
};

const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const recipeData = req.body;

  try {
    const result = await recipeService.updateRecipe(
      id,
      recipeData,
      req.user.id
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe updated" });
  } catch (error) {
    console.error("❌ Error in updateRecipe:", error);
    if (error.message === "No autorizado") {
      res
        .status(403)
        .json({ error: "No tienes permiso para actualizar esta receta" });
    } else {
      res.status(500).json({ error: "Failed to update recipe" });
    }
  }
};

const deleteRecipe = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await recipeService.deleteRecipe(id, req.user.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("❌ Error in deleteRecipe:", error);
    if (error.message === "No autorizado") {
      res
        .status(403)
        .json({ error: "No tienes permiso para eliminar esta receta" });
    } else {
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  updateRecipe,
  deleteRecipe,
  getMyRecipes, // <-- exporta el nuevo controlador
};
