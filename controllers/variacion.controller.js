const prisma = require('../prisma/client');


exports.getVariaciones = async (req, res) => {
  const variaciones = await prisma.variacion.findMany({});
  res.json(variaciones);
};

// Función para editar una variante
exports.editarVariacion = async (req, res) => {
  const { id, nuevaVariacion } = req.body; // ID y nuevo nombre de la variante
  try {
    const variacionActualizada = await prisma.variacion.update({
      where: { id:id },
      data: { 
        nombre: nuevaVariacion.nombre,
        precioAgregado: nuevaVariacion.precioAgregado,
        disponibilidad: nuevaVariacion.disponibilidad
       },
    });
    res.json(variacionActualizada);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la variacion.' });
  }
};

exports.eliminarVariacion = async (req, res) => {
  const { id } = req.body;  // Correctamente desestructura 'id' directamente de req.body

  try {
    await prisma.variacion.delete({ where: { id: parseInt(id) } });  // Asegúrate de que 'id' es un número
    res.json({ message: 'Variación eliminada correctamente.' });
  } catch (error) {
    console.error(error);  // Buenas prácticas: imprimir el error en la consola para depuración
    res.status(500).json({ error: 'No se pudo eliminar la variación.' });
  }
};

