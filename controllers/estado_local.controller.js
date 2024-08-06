const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getEstado = async (req, res) => {
  const estados = await prisma.estado_local.findMany({});
  res.json(estados[0]);
};

exports.editarEstadoLocal = async (req, res) => {
    const { id , estado } = req.body; 
    try {
      const estado_local = await prisma.estado_local.update({
        where: {
          id: id 
        },
        data: {
          estado: parseInt(estado)
        }
      });
      res.json(estado_local)
    } catch (error) {
      console.error('Error al editar el estado del local:', error);
      res.status(500).json({ error: 'Ocurrió un error al editar el estado del local' });
    }
};