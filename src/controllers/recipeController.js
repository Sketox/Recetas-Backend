const RecipeDTO = require("../DTO/dto-recipes.dto");
const recipeService = require("../services/recipeService");
const { ObjectId } = require("mongodb");
const { uploadImage } = require("../utils/cloudinary");
const fs = require("fs");

const createRecipe = async (req, res) => {
  console.log("📝 === CREAR RECETA ===");
  console.log("📝 req.body COMPLETO:", JSON.stringify(req.body, null, 2));
  console.log("� req.file:", req.file);
  console.log("👤 Usuario autenticado:", req.user);

  let imageUrl = "";

  // 📸 Si hay una imagen, subirla a Cloudinary
  if (req.file) {
    try {
      console.log("🚀 Subiendo imagen a Cloudinary...");
      const result = await uploadImage(req.file.path);
      imageUrl = result.secure_url;
      console.log("✅ Imagen subida exitosamente:", imageUrl);
      
      // 🗑️ Eliminar archivo temporal
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error("❌ Error al subir imagen:", uploadError);
      // Si falla la subida, eliminar archivo temporal y continuar sin imagen
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
    }
  }

  const recipeData = {
    title: req.body.title,
    description: req.body.description,
    ingredients: JSON.parse(req.body.ingredients || '[]'),
    instructions: JSON.parse(req.body.instructions || '[]'),
    prepTime: parseInt(req.body.prepTime),
    cookTime: parseInt(req.body.cookTime),
    servings: parseInt(req.body.servings),
    difficulty: req.body.difficulty,
    category: req.body.category,
    rating: parseInt(req.body.rating || '0'),
    imageUrl: imageUrl, // Usar la URL de Cloudinary o string vacío
    userId: req.user.id,
  };

  console.log("📦 Datos completos para validar:", JSON.stringify(recipeData, null, 2));

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
    console.error("❌ Stack trace:", error.stack);
    
    // Enviar más detalles del error al frontend
    res.status(500).json({ 
      success: false,
      error: "Ocurrió un error interno en el servidor",
      details: error.message 
    });
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
  console.log("📝 === GET MY RECIPES ===");
  console.log("🔑 req.user:", req.user);
  console.log("📍 URL completa:", req.originalUrl);

  // ✅ Validación para evitar errores si no hay usuario autenticado
  if (!req.user || !req.user.id) {
    console.log("❌ Usuario no autenticado en getMyRecipes");
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  try {
    console.log("🔍 Buscando recetas para el usuario:", req.user.id);
    const recipes = await recipeService.getRecipesByUser(req.user.id);
    console.log("📦 Recetas encontradas:", recipes.length);
    console.log("✅ Enviando respuesta exitosa");
    res.json(recipes);
  } catch (error) {
    console.error("❌ Error in getMyRecipes:", error);
    console.error("❌ Stack trace:", error.stack);
    res.status(500).json({ 
      error: "Failed to get recipe",
      details: error.message 
    });
  }
};

const updateRecipe = async (req, res) => {
  console.log("📝 === ACTUALIZAR RECETA ===");
  const { id } = req.params;
  
  console.log("🔍 ID de receta:", id);
  console.log("📤 Datos recibidos:", req.body);
  console.log("🖼️ Archivo recibido:", req.file ? req.file.filename : "No hay archivo");

  // 🖼️ Manejo de imagen si se proporciona una nueva
  let imageUrl = "";
  if (req.file) {
    try {
      console.log("📤 Subiendo nueva imagen a Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "recetas-app",
        quality: "auto",
        fetch_format: "auto",
      });
      
      imageUrl = result.secure_url;
      console.log("✅ Nueva imagen subida exitosamente:", imageUrl);
      
      // 🗑️ Eliminar archivo temporal
      fs.unlinkSync(req.file.path);
    } catch (uploadError) {
      console.error("❌ Error al subir nueva imagen:", uploadError);
      // Si falla la subida, eliminar archivo temporal
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
    }
  }

  // Preparar datos de actualización
  const updateData = {
    title: req.body.title,
    description: req.body.description,
    ingredients: JSON.parse(req.body.ingredients || '[]'),
    instructions: JSON.parse(req.body.instructions || '[]'),
    prepTime: parseInt(req.body.prepTime),
    cookTime: parseInt(req.body.cookTime),
    servings: parseInt(req.body.servings),
    difficulty: req.body.difficulty,
    category: req.body.category,
  };

  // Solo agregar imageUrl si se proporcionó una nueva imagen
  if (imageUrl) {
    updateData.imageUrl = imageUrl;
  }

  console.log("📦 Datos de actualización:", JSON.stringify(updateData, null, 2));

  try {
    const result = await recipeService.updateRecipe(
      id,
      updateData,
      req.user.id
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    // Obtener la receta actualizada para devolverla
    const updatedRecipe = await recipeService.getRecipeById(id);
    console.log("✅ Receta actualizada exitosamente");
    res.json(updatedRecipe);
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

const getSearchSuggestions = async (req, res) => {
  const { q } = req.query; // query de búsqueda
  console.log("🔍 Búsqueda de sugerencias recibida:", q);
  
  if (!q || q.trim().length < 2) {
    console.log("❌ Query muy corta o vacía");
    return res.json([]);
  }

  try {
    const searchTerm = q.trim();
    console.log("🔍 Término de búsqueda:", searchTerm);
    const suggestions = await recipeService.getSearchSuggestions(searchTerm);
    console.log("✅ Sugerencias encontradas:", suggestions.length);
    res.json(suggestions);
  } catch (error) {
    console.error("❌ Error in getSearchSuggestions:", error);
    res.status(500).json({ error: "Failed to get search suggestions" });
  }
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await recipeService.getRecipeById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("❌ Error in getRecipeById:", error);
    res.status(500).json({ error: "Failed to get recipe" });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
  getSearchSuggestions,
  getRecipeById,
};
