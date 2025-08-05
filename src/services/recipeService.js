const { ObjectId } = require("mongodb");

let recipeCollection;

function setCollection(collection) {
  console.log("✅ Collection set correctly");
  recipeCollection = collection;
}

async function createRecipe(data) {
  console.log("🔍 recipeService.createRecipe - data:", data);
  console.log("🔍 Collection disponible:", !!recipeCollection);
  
  if (!recipeCollection) {
    throw new Error("Collection no está inicializada");
  }
  
  try {
    const now = new Date();
    const recipe = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    
    console.log("📦 Recipe a insertar:", recipe);
    const result = await recipeCollection.insertOne(recipe);
    console.log("✅ Recipe insertada exitosamente:", result.insertedId);
    return result;
  } catch (dbError) {
    console.error("❌ Error en base de datos al crear receta:", dbError);
    throw dbError;
  }
}

async function getRecipes() {
  const recipes = await recipeCollection.find({}).toArray();
  return recipes.map((r) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
  }));
}

async function getRecipesByUser(userId) {
  console.log("🔍 recipeService.getRecipesByUser - userId:", userId);
  console.log("🔍 Collection disponible:", !!recipeCollection);
  
  if (!userId) {
    throw new Error("userId es requerido");
  }
  
  if (!recipeCollection) {
    throw new Error("Collection no está inicializada");
  }
  
  try {
    const recipes = await recipeCollection.find({ userId }).toArray();
    console.log("📦 Recetas encontradas en DB:", recipes.length);
    
    const formattedRecipes = recipes.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));
    
    console.log("✅ Recetas formateadas:", formattedRecipes.length);
    return formattedRecipes;
  } catch (dbError) {
    console.error("❌ Error en base de datos:", dbError);
    throw dbError;
  }
}

async function getRecipeById(id) {
  const recipe = await recipeCollection.findOne({ _id: new ObjectId(id) });
  if (!recipe) {
    return null;
  }
  return {
    ...recipe,
    id: recipe._id.toString(),
    _id: recipe._id.toString(), // Mantener ambos para compatibilidad
  };
}

async function updateRecipe(id, data, userId) {
  const recipe = await recipeCollection.findOne({ _id: new ObjectId(id) });

  // Verificar propiedad
  if (recipe.userId !== userId) {
    throw new Error("No autorizado");
  }

  const result = await recipeCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
  return result;
}

async function deleteRecipe(id, userId) {
  const recipe = await recipeCollection.findOne({ _id: new ObjectId(id) });

  // Verificar propiedad
  if (recipe.userId !== userId) {
    throw new Error("No autorizado");
  }

  const result = await recipeCollection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

async function getSearchSuggestions(searchTerm) {
  const regex = new RegExp(searchTerm, 'i'); // Case insensitive
  
  // Buscar por título y por ingredientes
  const recipes = await recipeCollection.find({
    $or: [
      { title: { $regex: regex } },
      { ingredients: { $elemMatch: { $regex: regex } } }
    ]
  }, {
    projection: { title: 1, ingredients: 1, imageUrl: 1, category: 1 }
  }).limit(5).toArray();

  // Formatear las sugerencias
  const suggestions = recipes.map(recipe => ({
    id: recipe._id.toString(),
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    category: recipe.category,
    matchedIngredients: recipe.ingredients.filter(ingredient => 
      regex.test(ingredient)
    )
  }));

  return suggestions;
}

module.exports = {
  setCollection,
  createRecipe,
  getRecipes,
  getRecipesByUser,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getSearchSuggestions,
};
