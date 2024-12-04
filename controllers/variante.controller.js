const prisma = require('../prisma/client');

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

// Función para eliminar una variante y sus variaciones
exports.eliminarVariante = async (req, res) => {
  const idVariante = parseInt(req.body.id); // Asegúrate de obtener correctamente el ID de la variante

  try {
    // Primero elimina todas las variaciones asociadas
    await prisma.variacion.deleteMany({
      where: {
        idVariante: idVariante
      }
    });

    // Luego elimina la variante
    await prisma.variante.delete({
      where: { id: idVariante }
    });

    res.json({ message: 'Variante y todas sus variaciones eliminadas correctamente.' });
  } catch (error) {
    console.error('Error al eliminar la variante:', error);
    res.status(500).json({ error: 'No se pudo eliminar la variante.' });
  }
};
