const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCategoria = async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    include: {
        productos: true,
      }
   });
  res.json(categorias);
};

exports.crearCategoria = async (req, res) => {
    const  {nombre} = req.body;

    try {
      // Crear el producto en la base de datos
      const categoria = await prisma.categoria.create({
        data: {nombre:nombre},
      });
      res.json(categoria)
    } catch (error) {
      console.error('Error al crear el producto, variantes y variaciones:', error);
      res.status(500).json({ error: 'Ocurrió un error al crear el producto, variantes y variaciones' });
    }
};

exports.editarCategoria = async (req, res) => {
    const { id, nombre } = req.body; 
  
    try {
      const categoria = await prisma.categoria.update({
        where: {
          id: id 
        },
        data: {
          nombre: nombre
        }
      });
      res.json(categoria)
    } catch (error) {
      console.error('Error al editar la categoria:', error);
      res.status(500).json({ error: 'Ocurrió un error al editar la categoria' });
    }
};

exports.eliminarCategoria = async (req, res) => {
    const  {id} = req.body;

    try {
      // Crear el producto en la base de datos
      const categoria = await prisma.categoria.delete({
        where:{id:id},
      });
      res.json(categoria)
    } catch (error) {
      console.error('Error al crear el producto, variantes y variaciones:', error);
      res.status(500).json({ error: 'Ocurrió un error al crear el producto, variantes y variaciones' });
    }
};
