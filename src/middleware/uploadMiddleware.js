const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Asegurar que la carpeta uploads existe
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Carpeta uploads creada");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📁 Guardando archivo en:", uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log("📄 Nombre de archivo:", filename);
    cb(null, filename);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

module.exports = upload;