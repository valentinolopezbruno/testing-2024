const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Función para editar una variante
exports.editarVariante = async (req, res) => {
  const { id, nombre } = req.body; // ID y nuevo nombre de la variante

  try {
    const varianteActualizada = await prisma.variante.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });
    res.json(varianteActualizada);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la variante.' });
  }
};

// Función para eliminar una variante
exports.eliminarVariante = async (req, res) => {
  const { id } = req.body; // ID de la variante a eliminar

  try {
    await prisma.variante.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Variante eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la variante.' });
  }
};
