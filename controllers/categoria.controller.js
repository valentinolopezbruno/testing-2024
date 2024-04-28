const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCategoria = async (req, res) => {
  const productos = await prisma.categoria.findMany({ });
  res.json(productos);
};

exports.crearCategoria = async (req, res) => {
    const { nuevoProducto} = req.body;
  
    try {
      // Crear el producto en la base de datos
      const productoCreado = await prisma.producto.create({
        data: {
          ...nuevoProducto,
          variantes: {
            create: variantes.map(variante => ({
              nombre: variante.nombre,
              variaciones: {
                create: variante.variaciones.map(variacion => ({
                  nombre: variacion.nombre,
                  precioAgregado: variacion.precioAgregado,
                  disponibilidad: variacion.disponibilidad
                }))
              }
            }))
          }
        },
        include: {
          variantes: {
            include: {
              variaciones: true
            }
          }
        }
      });
  
      res.status(201).json({ 
        mensaje: 'Producto, variantes y variaciones creados satisfactoriamente',
        producto: productoCreado
      });
    } catch (error) {
      console.error('Error al crear el producto, variantes y variaciones:', error);
      res.status(500).json({ error: 'Ocurrió un error al crear el producto, variantes y variaciones' });
    }
};

exports.editarCategoria = async (req, res) => {
    const { datosProducto } = req.body; // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
  
    try {
      // Actualizar el producto con los datos proporcionados
      const productoActualizado = await prisma.producto.update({
        where: {
          id: datosProducto.idProducto // Utilizar el ID del producto proporcionado en la solicitud
        },
        data: {
          nombre: datosProducto.nombre,
          precio: datosProducto.precio,
          formatoVenta: datosProducto.formatoVenta,
          descripcion: datosProducto.descripcion,
          imagen: datosProducto.imagen,
          promocion: datosProducto.promocion,
          precio_promocion: datosProducto.precio_promocion,
          disponibilidad: datosProducto.disponibilidad,
          idCategoria: datosProducto.idCategoria
        }
      });
  
      res.status(200).json({ mensaje: 'Producto actualizado correctamente', producto: productoActualizado });
    } catch (error) {
      console.error('Error al editar el producto:', error);
      res.status(500).json({ error: 'Ocurrió un error al editar el producto' });
    }
};