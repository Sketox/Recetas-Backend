const express = require("express");
const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const recipeService = require("./src/services/recipeService");

require("dotenv").config();
const app = express();
app.use(express.json());

connectDB().then((db) => {
  const recipeCollection = db.collection("recipes");
  recipeService.setCollection(recipeCollection); // 👈 muy importante

  console.log("✅ Recipe collection set!");

  app.use("/api/recipes", recipeRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
