const connectDB = require("../../config/db");
const { ObjectId } = require("mongodb");


const getProfile = async (req, res) => {
  try {
    console.log("👤 Obteniendo perfil de usuario...");
    console.log("🔑 req.user:", req.user);
    
    // Validar existencia de req.user y req.user.id
    if (!req.user || !req.user.id) {
      console.log("❌ Usuario no autenticado en req.user");
      return res.status(401).json({ error: "No autorizado" });
    }

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(req.user.id)) {
      console.log("❌ ID de usuario inválido:", req.user.id);
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const db = await connectDB();
    const users = db.collection("users");

    console.log("🔍 Buscando usuario con ID:", req.user.id);

    const user = await users.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      console.log("❌ Usuario no encontrado en la base de datos");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si el campo icon no existe, asignar uno por defecto
    if (!user.icon) {
      user.icon = "user-circle";
    }

    console.log("✅ Usuario encontrado:", { id: user._id, name: user.name, email: user.email });
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

const updateIcon = async (req, res) => {
  try {
    console.log("🎨 Actualizando ícono de usuario...");
    console.log("🔑 req.user:", req.user);
    console.log("📝 req.body:", req.body);
    
    const { icon } = req.body;
    
    if (!icon) {
      return res.status(400).json({ error: "El ícono es requerido" });
    }

    // Validar existencia de req.user y req.user.id
    if (!req.user || !req.user.id) {
      console.log("❌ Usuario no autenticado en req.user");
      return res.status(401).json({ error: "No autorizado" });
    }

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(req.user.id)) {
      console.log("❌ ID de usuario inválido:", req.user.id);
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const db = await connectDB();
    const users = db.collection("users");
    
    const result = await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { icon, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    console.log("✅ Ícono actualizado exitosamente");
    res.json({ 
      message: "Ícono actualizado exitosamente", 
      icon,
      success: true 
    });
  } catch (error) {
    console.error("❌ Error al actualizar ícono:", error);
    res.status(500).json({ error: "Error al actualizar ícono" });
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

module.exports = { getProfile, updateProfile, updateIcon, deleteProfile };
