const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.eliminarDetalle = async (req, res) => {
    const { id } = req.body;

    try {
      const detalleEliminado = await prisma.detallePedido.delete({
        where: {
            id:id
        }
      });
      res.json(detalleEliminado);
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      res.status(500).send("Error interno del servidor");
    }
  };