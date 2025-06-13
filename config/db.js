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
  connectTimeoutMS: 10000, // 10 segundos de timeout para conexión
  socketTimeoutMS: 45000, // 45 segundos de timeout para operaciones
  maxPoolSize: 10, // Número máximo de conexiones en el pool
  ssl: true,
  tlsAllowInvalidCertificates: false, // Seguro en producción
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
    await client.connect();

    // Verifica la conexión con un ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Conectado exitosamente a MongoDB Atlas");

    cachedDb = client.db("recetasDB"); // Cachear la referencia
    return cachedDb;
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB Atlas:", err);

    // Cierra la conexión si existe
    if (client) {
      await client.close();
    }

    process.exit(1); // Sale con código de error
  }
}

// Manejador para cierre limpio al terminar la aplicación
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("🔌 Conexión a MongoDB cerrada");
    process.exit(0);
  }
});

module.exports = connectDB;
