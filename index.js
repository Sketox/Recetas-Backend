const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/recetas", require("./routes/recetas"));

// Conectar a la base de datos y levantar servidor
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
