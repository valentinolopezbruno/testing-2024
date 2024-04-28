const {v2 }= require("cloudinary")

v2.config({ 
    cloud_name: 'dnajapejz', 
    api_key: '951785326535919', 
    api_secret: 'XgycqSLfWQ0JCr5_g3JO9R3AEok'
  });

exports.subirImagen = async (filePath) => {
    return await v2.uploader.upload(filePath, {
        folder:"TuttoBene"
    })
};

exports.eliminarImagen = async (publicId) => {
    try {
        const resultado = await v2.uploader.destroy(publicId);
        return resultado;
    } catch (error) {
        console.error("Error al eliminar la imagen de Cloudinary:", error);
        throw new Error("Error al eliminar la imagen de Cloudinary");
    }
};

