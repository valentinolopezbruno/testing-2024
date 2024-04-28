const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// Función para eliminar una variante
exports.eliminarVariacion = async (req, res) => {
  const { id } = req.body; // ID de la variante a eliminar

  try {
    await prisma.variacion.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'variacion eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la variacion.' });
  }
};
