const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getHorarios = async (req, res) => {
  const horarios = await prisma.horario.findMany({});
  res.json(horarios);
};

exports.crearHorario = async (req, res) => {
    const { dia, apertura, cierre } = req.body;

    try {
      const nuevoHorario = await prisma.horario.create({
        data: {
          dia,
          apertura: new Date(`1970-01-01T${apertura}:00.000Z`), // Añade una fecha ficticia
          cierre: new Date(`1970-01-01T${cierre}:00.000Z`)
        }
      });
      res.json(nuevoHorario);
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      res.status(500).send("Error interno del servidor");
    }
  };

  exports.eliminarHorario = async (req, res) => {
    const { id } = req.body;

    try {
      const horarioEliminado = await prisma.horario.delete({
        where: {
            id:id
        }
      });
      res.json(horarioEliminado);
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      res.status(500).send("Error interno del servidor");
    }
  };

  exports.actualizarHorario = async (req, res) => {
    const { id, dia, apertura, cierre } = req.body;

    console.log(id,dia,apertura,cierre)

    try {
      const nuevoHorario = await prisma.horario.update({
        where:{id:id},
        data: {
          dia,
          apertura: new Date(`1970-01-01T${apertura}:00.000Z`),
          cierre: new Date(`1970-01-01T${cierre}:00.000Z`)
        }
      });
      res.json(nuevoHorario);
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      res.status(500).send("Error interno del servidor");
    }
  };