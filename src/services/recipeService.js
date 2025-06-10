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

module.exports = {
  setCollection,
  createRecipe,
  getRecipes,
};
