const { ObjectId } = require("mongodb");
const connectDB = require("../../config/db");

const addToFavorites = async (req, res) => {
  console.log("❤️ === AGREGAR A FAVORITOS ===");
  const { recipeId } = req.body;
  const userId = req.user.id;

  console.log("👤 Usuario:", userId);
  console.log("🍽️ Receta:", recipeId);

  // Validar datos de entrada
  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  if (!ObjectId.isValid(recipeId) || !ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid recipe or user ID" });
  }

  try {
    const database = await connectDB();
    const favoritesCollection = database.collection("favorites");

    // Verificar si ya existe
    const existingFavorite = await favoritesCollection.findOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    });

    if (existingFavorite) {
      return res.status(400).json({ error: "Recipe already in favorites" });
    }

    // Agregar a favoritos
    const result = await favoritesCollection.insertOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId),
      createdAt: new Date()
    });

    console.log("✅ Favorito agregado:", result.insertedId);
    res.status(201).json({ message: "Added to favorites", id: result.insertedId });
  } catch (error) {
    console.error("❌ Error al agregar favorito:", error);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
};

const removeFromFavorites = async (req, res) => {
  console.log("💔 === REMOVER DE FAVORITOS ===");
  const { recipeId } = req.params;
  const userId = req.user.id;

  console.log("👤 Usuario:", userId);
  console.log("🍽️ Receta ID:", recipeId);

  // Validar IDs
  if (!ObjectId.isValid(recipeId) || !ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid recipe or user ID" });
  }

  try {
    const database = await connectDB();
    const favoritesCollection = database.collection("favorites");

    const result = await favoritesCollection.deleteOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    console.log("✅ Favorito removido");
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("❌ Error al remover favorito:", error);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
};

const getFavorites = async (req, res) => {
  console.log("📋 === OBTENER FAVORITOS ===");
  const userId = req.user.id;

  console.log("👤 Usuario:", userId);

  // Validar user ID
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const database = await connectDB();
    const favoritesCollection = database.collection("favorites");
    const recipesCollection = database.collection("recipes");

    // Obtener IDs de recetas favoritas
    const favorites = await favoritesCollection.find({
      userId: new ObjectId(userId)
    }).toArray();

    const recipeIds = favorites.map(fav => fav.recipeId);

    // Obtener las recetas completas
    const favoriteRecipes = await recipesCollection.find({
      _id: { $in: recipeIds }
    }).toArray();

    console.log("📦 Favoritos encontrados:", favoriteRecipes.length);
    res.json(favoriteRecipes);
  } catch (error) {
    console.error("❌ Error al obtener favoritos:", error);
    res.status(500).json({ error: "Failed to retrieve favorites" });
  }
};

const checkIfFavorite = async (req, res) => {
  console.log("🔍 === VERIFICAR FAVORITO ===");
  const { recipeId } = req.params;
  const userId = req.user?.id;

  console.log("👤 Usuario:", userId);
  console.log("🍽️ Receta ID:", recipeId);

  // Si no hay usuario autenticado, devolver false
  if (!userId) {
    console.log("ℹ️ Usuario no autenticado, favorito = false");
    return res.json({ isFavorite: false });
  }

  // Validar IDs
  if (!ObjectId.isValid(recipeId) || !ObjectId.isValid(userId)) {
    console.log("❌ IDs inválidos");
    return res.status(400).json({ error: "Invalid recipe or user ID" });
  }

  try {
    const database = await connectDB();
    const favoritesCollection = database.collection("favorites");

    const favorite = await favoritesCollection.findOne({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    });

    console.log("📋 Favorito encontrado:", !!favorite);
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("❌ Error al verificar favorito:", error);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkIfFavorite
};
