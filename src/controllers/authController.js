const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserDTO = require("../DTO/dto-user.dto");
const connectDB = require("../../config/db"); // Ruta corregida

const register = async (req, res) => {
  const userDTO = new UserDTO(req.body);

  if (!userDTO.isValidRegister()) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({
      email: userDTO.email,
    });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userDTO.password, salt);

    // Icono por defecto si no se proporciona
    const defaultIcons = [
      "face-smile",
      "user-circle",
      "bolt",
      "sparkles",
      "sun",
      "fire",
      "heart",
    ];

    const icon = userDTO.icon || defaultIcons[Math.floor(Math.random() * defaultIcons.length)];    
    
    // Crear nuevo usuario
    const newUser = {
      name: userDTO.name,
      email: userDTO.email,
      password: hashedPassword,
      icon,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Generar JWT
    const payload = {
      user: {
        id: result.insertedId.toString(),
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("❌ Error al generar JWT:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }
        res.status(201).json({ token, icon });
      }
    );
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

const login = async (req, res) => {
  const userDTO = new UserDTO(req.body);

  if (!userDTO.isValidLogin()) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Verificar si el usuario existe
    const user = await usersCollection.findOne({ email: userDTO.email });
    if (!user) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(userDTO.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Generar JWT
    const payload = {
      user: {
        id: user._id.toString(),
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("❌ Error al generar JWT:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }
        res.status(200).json({ token, icon: user.icon  });
      }
    );
  } catch (error) {
    console.error("❌ Error en login:", error);
    res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};

module.exports = { login };

module.exports = { register, login };
