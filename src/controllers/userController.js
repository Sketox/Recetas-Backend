const connectDB = require("../../config/db");
const { ObjectId } = require("mongodb");

const getProfile = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
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