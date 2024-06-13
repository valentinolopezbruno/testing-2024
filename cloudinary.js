const { v2: cloudinary } = require('cloudinary');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dnajapejz',
  api_key: '951785326535919',
  api_secret: 'XgycqSLfWQ0JCr5_g3JO9R3AEok'
});

async function convertirYSubirImagen(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const webpPath = path.join(path.dirname(filePath), `${fileName}.webp`);

  try {
    // Convertir la imagen a .webp
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Subir la imagen convertida a Cloudinary
    const result = await cloudinary.uploader.upload(webpPath, {
      folder: 'TuttoBene'
    });

    // Eliminar el archivo .webp local después de subirlo
    fs.unlinkSync(webpPath);

    return result;
  } catch (error) {
    console.error('Error al convertir y subir la imagen:', error);
    throw error;
  }
}

exports.subirImagen = async (filePath) => {
  return await convertirYSubirImagen(filePath);
};

exports.eliminarImagen = async (publicId) => {
  try {
    const resultado = await cloudinary.uploader.destroy(publicId);
    return resultado;
  } catch (error) {
    console.error("Error al eliminar la imagen de Cloudinary:", error);
    throw new Error("Error al eliminar la imagen de Cloudinary");
  }
};
