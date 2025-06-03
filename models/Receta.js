const mongoose = require("mongoose");

const recetaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    ingredientes: [String],
    dificultad: { type: String, enum: ["fácil", "media", "difícil"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receta", recetaSchema);
