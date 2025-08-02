const connectDB = require("../../config/db");
const { ObjectId } = require("mongodb");


const getProfile = async (req, res) => {
  try {
    // Validar existencia de req.user y req.user.id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si el campo icon no existe, asignar uno por defecto
    if (!user.icon) {
      user.icon = "face-smile";
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error en getProfile:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const { name, email } = req.body;
    const result = await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name, email, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const result = await users.deleteOne({ _id: new ObjectId(req.user.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

module.exports = { getProfile, updateProfile, deleteProfile };
