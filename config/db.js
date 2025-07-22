const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

// Configuración optimizada para MongoDB Atlas
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000, // Aumentado a 30 segundos
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  ssl: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  retryReads: true,
  w: "majority",
});

// Variable para cachear la conexión
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    console.log("♻️ Usando conexión caché a MongoDB");
    return cachedDb;
  }

  try {
    console.log("🔗 Intentando conectar a MongoDB Atlas...");
    await client.connect();

    // Verifica la conexión con un ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Conectado exitosamente a MongoDB Atlas");

    cachedDb = client.db("recetasDB"); // Cachear la referencia
    return cachedDb;
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB Atlas:", err);
    console.error("Detalles del error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    // Intenta cerrar la conexión si existe
    if (client) {
      try {
        await client.close();
        console.log("🔌 Conexión a MongoDB cerrada");
      } catch (closeErr) {
        console.error("❌ Error al cerrar la conexión:", closeErr);
      }
    }

    process.exit(1); // Sale con código de error
  }
}

// Manejador para cierre limpio al terminar la aplicación
process.on("SIGINT", async () => {
  if (client) {
    try {
      await client.close();
      console.log("🔌 Conexión a MongoDB cerrada (SIGINT)");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error al cerrar la conexión (SIGINT):", err);
      process.exit(1);
    }
  }
});

// Manejador para errores no capturados
process.on("uncaughtException", async (err) => {
  console.error("⚠️ Error no capturado:", err);
  if (client) {
    try {
      await client.close();
      console.log("🔌 Conexión a MongoDB cerrada (uncaughtException)");
    } catch (closeErr) {
      console.error(
        "❌ Error al cerrar la conexión (uncaughtException):",
        closeErr
      );
    }
  }
  process.exit(1);
});

module.exports = connectDB;
