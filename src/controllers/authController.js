const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserDTO = require("../DTO/dto-user.dto");

const register = async (req, res) => {
  const userDTO = new UserDTO(req.body);

  if (!userDTO.isValidRegister()) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: userDTO.email });
    if (user) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userDTO.password, salt);

    // Crear nuevo usuario
    user = new User({
      name: userDTO.name,
      email: userDTO.email,
      password: hashedPassword,
    });

    await user.save();

    // Generar JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const login = async (req, res) => {
  const userDTO = new UserDTO(req.body);

  if (!userDTO.isValidLogin()) {
    return res.status(400).json({ error: "Credenciales inválidas" });
  }

  try {
    // Verificar usuario
    const user = await User.findOne({ email: userDTO.email });
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
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { register, login };
