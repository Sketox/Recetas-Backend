const { ObjectId } = require("mongodb");

let recipeCollection;
let userCollection;

function setCollection(collection) {
  console.log("✅ Collection set correctly");
  recipeCollection = collection;
}

function setUserCollection(collection) {
  console.log("✅ User Collection set correctly");
  userCollection = collection;
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
  
  // Obtener información de usuarios para las recetas que tienen userId
  const recipesWithAuthors = await Promise.all(
    recipes.map(async (recipe) => {
      let authorInfo = null;
      
      if (recipe.userId && userCollection) {
        try {
          const user = await userCollection.findOne({ _id: new ObjectId(recipe.userId) });
          if (user) {
            authorInfo = {
              name: user.name,
              icon: user.icon
            };
          }
        } catch (error) {
          console.log("Error obteniendo usuario:", error);
        }
      }
      
      return {
        ...recipe,
        id: recipe._id.toString(),
        _id: undefined,
        author: authorInfo
      };
    })
  );
  
  return recipesWithAuthors;
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

async function getCategories() {
  try {
    // Agregación para contar recetas por categoría
    const categoryCounts = await recipeCollection.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    // Mapa de iconos para cada categoría
    const categoryIcons = {
      "Desayuno": "🥐",
      "Almuerzo": "🍴", 
      "Cena": "🍝",
      "Postre": "🍰",
      "Snack": "🍪"
    };

    // Formatear respuesta
    const categories = categoryCounts.map(cat => ({
      name: cat._id,
      count: cat.count,
      icon: categoryIcons[cat._id] || "🍽️"
    }));

    // Agregar categorías sin recetas con count 0
    const allCategories = ["Desayuno", "Almuerzo", "Cena", "Postre", "Snack"];
    const existingCategories = categories.map(c => c.name);
    
    allCategories.forEach(catName => {
      if (!existingCategories.includes(catName)) {
        categories.push({
          name: catName,
          count: 0,
          icon: categoryIcons[catName] || "🍽️"
        });
      }
    });

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    throw error;
  }
}

module.exports = {
  setCollection,
  setUserCollection,
  createRecipe,
  getRecipes,
  getRecipesByUser,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getSearchSuggestions,
  getCategories,
};
