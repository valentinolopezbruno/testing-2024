const prisma = require('../prisma/client');

const io  = require("../app")

exports.getPedidos = async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    include: {
        detalles: true,
        detalles: {
            include: {
              productoRel: true,
              productoRel:{
                include: {
                    variantes: true, 
                    variantes: {
                      include: {
                        variaciones: true
                      }
                    }
                  }
              }
            }
          }
      }
   });
  res.json(pedidos);
};

exports.crearPedido = async (req, res) => {
    const Pedido = req.body.Pedido;

    console.log("Nuevo Pedido:", Pedido);

    // Definimos productos aquí para que puedas usarlo en la creación de detalles
    const productos = Pedido.productos;

    try {
        const nuevoPedido = await prisma.pedido.create({
            data: {
                cliente: Pedido.cliente,
                totalProductos: calcularTotalProductos(Pedido),
                fecha: calcularFecha(),
                localidad: Pedido.localidad,
                direccion: Pedido.direccion,
                pagado: parseInt(Pedido.pagado), 
                formaPago: parseInt(Pedido.formaPago),
                tipoEntrega: Pedido.tipoEntrega,
                tipoPedido: Pedido.tipoPedido,
                estado: 0, // Pendiente
                telefono: parseInt(Pedido.telefono),
                detalles: {
                    createMany: {
                        data: productos.map(producto => ({
                            idProducto: parseInt(producto.id),
                            cantidad: producto.cantidad,
                            precioUnitario: producto.precio,
                            total: totalDetalle(producto),
                            idVariacion: calcularVariaciones(producto)
                        }))
                    }
                }
            },
            include: {
              detalles: true,
              detalles: {
                  include: {
                    productoRel: true,
                    productoRel:{
                      include: {
                          variantes: true,
                          variantes: {
                            include: {
                              variaciones: true
                            }
                          }
                        }
                    }
                  }
                }
            }
        });
        io.emit('nuevo-pedido', nuevoPedido);
        res.json(nuevoPedido);
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ error: 'Ocurrió un error al crear el pedido' });
    }
};

exports.crearPedidoWeb = async (req, res) => {
  // Metodo para crear el pedido que viene de la web
  const Pedido = req.body.Pedido;

  console.log("Nuevo Pedido: ", Pedido);

  // Definimos productos aquí para que puedas usarlo en la creación de detalles
  const productos = Pedido.productos;

  try {
      const nuevoPedido = await prisma.pedido.create({
          data: {
              cliente: Pedido.cliente,
              totalProductos: calcularTotalProductos(Pedido),
              fecha: calcularFecha(),
              localidad: Pedido.localidad,
              direccion: Pedido.direccion,
              pagado: 0, 
              formaPago: parseInt(Pedido.formaPago),
              tipoEntrega: Pedido.tipoEntrega,
              tipoPedido: 1,
              estado: 0, // Pendiente
              telefono: parseInt(Pedido.telefono),
              detalles: {
                  createMany: {
                      data: productos.map(producto => ({
                          idProducto: parseInt(producto.id),
                          cantidad: producto.cantidad,
                          precioUnitario: producto.precio,
                          total: totalDetalle(producto),
                          idVariacion: calcularVariacionesWeb(producto)
                      }))
                  }
              }
          },
          include: {
            detalles: true,
            detalles: {
                include: {
                  productoRel: true,
                  productoRel:{
                    include: {
                        variantes: true,
                        variantes: {
                          include: {
                            variaciones: true
                          }
                        }
                      }
                  }
                }
              }
          }
      });
      io.emit('nuevo-pedido', nuevoPedido);
      res.json(nuevoPedido);
  } catch (error) {
      console.error('Error al crear el pedido:', error);
      res.status(500).json({ error: 'Ocurrió un error al crear el pedido' });
  }
};

exports.cambioEstado = async (req, res) => {
    const {id, estado} = req.body; // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
    try {
      // Actualizar el producto con los datos proporcionados
      const Pedido = await prisma.pedido.update({
        where: {
          id: parseInt(id) // Utilizar el ID del producto proporcionado en la solicitud
        },
        data: {
          estado: parseInt(estado)
        }
      });
      console.log("cambio estado")
      io.emit('cambioEstado', Pedido);
      res.json(Pedido)
    } catch (error) {
      console.error('Error al editar el Pedido:', error);
      res.status(500).json({ error: 'Ocurrió un error al editar el Pedido' });
    }
  };

exports.cambioPagado = async (req, res) => {
    const {id, pagado} = req.body; // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
    try {
      // Actualizar el producto con los datos proporcionados
      const Pedido = await prisma.pedido.update({
        
        where: {
          id: parseInt(id) // Utilizar el ID del producto proporcionado en la solicitud
        },
        data: {
          pagado: parseInt(pagado)
        }
      });
  
      res.json(Pedido)
    } catch (error) {
      console.error('Error al editar el Pedido:', error);
      res.status(500).json({ error: 'Ocurrió un error al editar el Pedido' });
    }
  };

calcularTotal = (Pedido) => {
    var total = 0;
    // Verificar si Pedido.productos está definido y es un array
    if (Array.isArray(Pedido.productos)) {
        for (let i = 0; i < Pedido.productos.length; i++) {
            total = total + Pedido.productos[i].cantidad * Pedido.productos[i].precio;
            console.log(total);
        }
    } else {
        console.error("Pedido.productos no está definido o no es un array");
    }
    return total;
};

calcularTotalProductos = (Pedido) => {
    let productosTotales = 0;
    // Verificar si Pedido.productos está definido y es un array
    if (Array.isArray(Pedido.productos)) {
        for (let i = 0; i < Pedido.productos.length; i++) {
            productosTotales = productosTotales + Pedido.productos[i].cantidad;
        }
    } else {
        console.error("Pedido.productos no está definido o no es un array");
    }
    return productosTotales;
};


totalDetalle = (producto) => {
    return producto.cantidad * producto.precio;
};

calcularVariaciones = (producto) => {
  var idVariacion = "";
  for(let i=0; i < producto.variantes.length; i++){
    idVariacion = idVariacion + "-" + producto.variantes[i].variacionSeleccionada
  }
  console.log("idVariacion")
  console.log(idVariacion)
  return idVariacion
}

calcularFecha=()=>{
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString(); // Formato de fecha local
  return fecha
}

calcularVariacionesWeb = (producto) => {
  var idVariacion = "";
  for(let i=0; i < producto.variacionesSeleccionadas.length; i++){
    idVariacion = idVariacion + "-" + producto.variacionesSeleccionadas[i].id
  }
  console.log("idVariacion")
  console.log(idVariacion)
  return idVariacion
}