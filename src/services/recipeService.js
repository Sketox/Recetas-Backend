let recipeCollection;

function setCollection(collection) {
  console.log("✅ Collection set correctly");
  recipeCollection = collection;
}

async function createRecipe(data) {
  const now = new Date();
  const recipe = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const result = await recipeCollection.insertOne(recipe);
  return result;
}

async function getRecipes() {
  const recipes = await recipeCollection.find({}).toArray();
  return recipes.map((r) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
  }));
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

module.exports = {
  setCollection,
  createRecipe,
  getRecipes,
};
