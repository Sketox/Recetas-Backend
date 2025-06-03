const Receta = require("../models/receta");

// GET /api/recetas
exports.obtenerRecetas = async (req, res) => {
  const recetas = await Receta.find();
  res.json(recetas);
};

// POST /api/recetas
exports.crearReceta = async (req, res) => {
  try {
    const nueva = new Receta(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
