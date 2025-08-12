const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "recetas",
    resource_type: "image",
  });
};

module.exports = { uploadImage };