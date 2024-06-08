const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const subirImagen = require("../cloudinary");
const fs = require("fs-extra")

exports.getProductos = async (req, res) => {
  const productos = await prisma.producto.findMany({
    include: {
      variantes: true,
      variantes: {
        include: {
          variaciones: true
        }
      }
    }
  });
  res.json(productos);
};

exports.getProductosDisponibles = async (req, res) => {
  const productos = await prisma.producto.findMany({
    where: {
      disponibilidad: 0
    },
    include: {
      variantes: {
        include: {
          variaciones: true
        }
      }
    }
  });
  res.json(productos);
};

exports.crearProducto = async (req, res) => {
  const nuevoProducto = JSON.parse(req.body.nuevoProducto);
   const variantes = JSON.parse(req.body.variantes);
  console.log("Nuevo Producto:", nuevoProducto);
  console.log("Variantes:", variantes);

  try {
    // Manejar la subida de imagen
    let public_id = "No Image";
    let secure_url = "No Image";
    if (req.files && req.files.imagen) {
      const result = await subirImagen.subirImagen(req.files.imagen.tempFilePath);
      public_id = result.public_id;
      secure_url = result.secure_url;
      fs.unlink(req.files.imagen.tempFilePath); // Eliminar el archivo temporal
    }

    // Crear el producto en la base de datos
    const productoCreado = await prisma.producto.create({
      data: {
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        descripcion:nuevoProducto.descripcion,
        imagen:secure_url,
        public_id:public_id,
        formatoVenta: nuevoProducto.formatoVenta,
        disponibilidad:0,
        idCategoria: nuevoProducto.idCategoria,
        promocion: nuevoProducto.promocion,
        precio_promocion: nuevoProducto.precio_promocion,
        estado:0,
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

    res.json(productoCreado);
  } catch (error) {
    console.error('Error al crear el producto, variantes y variaciones:', error);
    res.status(500).json({ error: 'Ocurrió un error al crear el producto, variantes y variaciones' });
  }
};

exports.editarProducto = async (req, res) => {
  try {
    const nuevoProducto = JSON.parse(req.body.nuevoProducto);
    const variantes = JSON.parse(req.body.variantes);

    let imagenUrl = nuevoProducto.imagen;
    let publicId = nuevoProducto.public_id;

    // Gestión de nueva imagen
    if (req.files?.imagen) {
      const result = await subirImagen.subirImagen(req.files.imagen.tempFilePath);
      imagenUrl = result.secure_url;
      publicId = result.public_id;
      if (nuevoProducto.public_id) {
        await subirImagen.eliminarImagen(nuevoProducto.public_id);
      }
      fs.unlinkSync(req.files.imagen.tempFilePath);
    }

    // Actualizar el producto principal
    const producto = await prisma.producto.update({
      where: { id: nuevoProducto.id },
      data: {
        idCategoria: nuevoProducto.idCategoria,
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        descripcion: nuevoProducto.descripcion,
        formatoVenta: nuevoProducto.formatoVenta,
        imagen: imagenUrl,
        public_id: publicId,
        promocion: nuevoProducto.promocion,
        precio_promocion: nuevoProducto.precio_promocion
      },
    });

    console.log('Producto actualizado correctamente:', producto);

    // Proceso de actualización de variantes y variaciones
    for (const variante of variantes) {
      if (variante.id) {
        const updatedVariante = await prisma.variante.update({
          where: { id: variante.id },
          data: { nombre: variante.nombre, },
        });
        console.log('Variante actualizada:', updatedVariante);

        for (const variacion of variante.variaciones) {
          if (variacion.id) {
            await prisma.variacion.update({
              where: { id: variacion.id },
              data: {
                nombre: variacion.nombre,
                precioAgregado: variacion.precioAgregado,
                disponibilidad: variacion.disponibilidad,
              }
            });
          } else {
            await prisma.variacion.create({
              data: {
                nombre: variacion.nombre,
                precioAgregado: variacion.precioAgregado,
                disponibilidad: variacion.disponibilidad,
                idVariante: variante.id
              }
            });
          }
        }
      } else {
        const nuevaVariante = await prisma.variante.create({
          data: {
            nombre: variante.nombre,
            idProducto: producto.id,
            variaciones: {
              create: variante.variaciones.map(variacion => ({
                nombre: variacion.nombre,
                precioAgregado: variacion.precioAgregado,
                disponibilidad: variacion.disponibilidad
              }))
            }
          }
        });
        console.log('Nueva variante creada:', nuevaVariante);
      }
    }

    // ahora le hago un get al proudcto y se lo devulevo con la misma estructura que los demas para pushearlo directamente 
    const productoEstructurado = await prisma.producto.findFirst({
      where:{id:nuevoProducto.id},
      include: {
        variantes: true,
        variantes: {
          include: {
            variaciones: true
          }
        }
      }
    });
    res.json({producto: productoEstructurado});
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).send({ error: 'Error al actualizar el producto y sus variantes' });
  }
};

exports.cambioDisponibilidad = async (req, res) => {
  const datosProducto = req.body; // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
  console.log(datosProducto)
  try {
    // Actualizar el producto con los datos proporcionados
    const productoActualizado = await prisma.producto.update({
      where: {
        id: datosProducto.id // Utilizar el ID del producto proporcionado en la solicitud
      },
      data: {
        disponibilidad: datosProducto.disponibilidad,
      }
    });

    res.status(200).json({ mensaje: 'Producto actualizado correctamente', producto: productoActualizado });
  } catch (error) {
    console.error('Error al editar el producto:', error);
    res.status(500).json({ error: 'Ocurrió un error al editar el producto' });
  }
};

exports.eliminarProducto = async (req, res) => {
  // en realidad no lo elimino, sino quye cambio el estado a 1 y esta desabilitado
  const datosProducto = req.body; // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
  console.log(datosProducto)
  try {
    // Actualizar el producto con los datos proporcionados
    const productoActualizado = await prisma.producto.update({
      where: {
        id: datosProducto.id // Utilizar el ID del producto proporcionado en la solicitud
      },
      data: {
        disponibilidad: 1,
        estado: 1
      }
    });

    res.json(productoActualizado)
  } catch (error) {
    console.error('Error al editar el producto:', error);
    res.status(500).json({ error: 'Ocurrió un error al editar el producto' });
  }
};

exports.cambioEstadoDisponible = async (req, res) => {
  // en realidad no lo elimino, sino quye cambio el estado a 1 y esta desabilitado
  const datosProducto = req.body; // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
  console.log(datosProducto)
  try {
    // Actualizar el producto con los datos proporcionados
    const productoActualizado = await prisma.producto.update({
      where: {
        id: datosProducto.id // Utilizar el ID del producto proporcionado en la solicitud
      },
      data: {
        estado: 0
      }
    });

    res.json(productoActualizado)
  } catch (error) {
    console.error('Error al editar el producto:', error);
    res.status(500).json({ error: 'Ocurrió un error al editar el producto' });
  }
};