const RecipeDTO = require("../DTO/dto-recipes.dto");
const recipeService = require("../services/recipeService");

const createRecipe = async (req, res) => {
  const dto = new RecipeDTO(req.body);

  if (!dto.isValid()) {
    return res.status(400).json({ error: "Invalid recipe data" });
  }

  try {
    const result = await recipeService.createRecipe(dto);
    res.status(201).json({ message: "Recipe created", id: result.insertedId });
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

module.exports = {
  createRecipe,
  getRecipes,
};
