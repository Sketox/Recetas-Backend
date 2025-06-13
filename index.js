const express = require("express");
const connectDB = require("./config/db");
const recipeRoutes = require("./src/routes/recipes");
const recipeService = require("./src/services/recipeService");
const deepseekChat = require("./src/routes/deepseekChat"); // Cambiado a OpenAI Chat

require("dotenv").config();
const app = express();
app.use(express.json());
app.use("/api/recipes", recipeRoutes);
app.use("/api/ai", deepseekChat);

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
