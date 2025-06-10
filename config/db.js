const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conectado exitosamente a MongoDB Atlas con driver nativo");

    // Puedes guardar la referencia a la DB si la necesitas en otros módulos:
    const db = client.db("recetasDB");
    return db;
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB Atlas:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
