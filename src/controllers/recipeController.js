const RecipeDTO = require("../DTO/dto-recipes.dto");
const recipeService = require("../services/recipeService");
const { ObjectId } = require("mongodb");
const { uploadImage } = require("../utils/cloudinary");
const fs = require("fs");

const createRecipe = async (req, res) => {
  let imageUrl = "";
  try {
    if (req.file) {
      const result = await uploadImage(req.file.path);
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // Elimina el archivo temporal
    }

    const recipeData = {
      ...req.body,
      userId: req.user.id,
      imageUrl, // Guarda la URL de Cloudinary
    };

    const dto = new RecipeDTO(recipeData);

    if (!dto.isValid()) {
      return res.status(400).json({ error: "Invalid recipe data" });
    }

    const resultDb = await recipeService.createRecipe(dto);
    res.status(201).json({ message: "Recipe created", id: resultDb.insertedId });
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
  try {
    const recipes = await recipeService.getRecipesByUser(req.user.id);
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
