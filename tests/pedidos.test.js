jest.mock('../prisma/client', () => ({
    pedido: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    detalle: {
      createMany: jest.fn(),
      update: jest.fn(),
    },
  }));
  
  // Mockear imageService para evitar llamadas reales a servicios externos
  jest.mock('../cloudinary', () => ({
    subirImagen: jest.fn(),
    eliminarImagen: jest.fn(),
  }));
  
  // Mockear fs-extra para evitar operaciones de sistema de archivos reales
  jest.mock('fs-extra', () => ({
    unlinkSync: jest.fn(),
  }));
  
  // Mockear io para evitar emisiones reales de eventos
  jest.mock('../app', () => ({
    emit: jest.fn(),
  }));
  
  // Importar el controlador después de mockear Prisma y otras dependencias
  const {
    getPedidos,
    crearPedido,
    crearPedidoWeb,
    cambioEstado,
    cambioPagado,
  } = require('../controllers/pedido.controller');
  
  const prisma = require('../prisma/client');
  const imageService = require('../cloudinary');
  const fs = require('fs-extra');
  const io = require('../app');
  
  describe('Pedidos Controller', () => {
    // Limpiar los mocks después de cada prueba para evitar interferencias entre tests
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Test para getPedidos
    describe('getPedidos', () => {
      it('debe retornar una lista de pedidos', async () => {
        // Datos de ejemplo que retornará el mock de Prisma
        const pedidosMock = [
          {
            id: 1,
            cliente: 'Cliente 1',
            totalProductos: 3,
            fecha: '2023-10-01',
            localidad: 'Localidad A',
            direccion: 'Dirección 1',
            pagado: 1,
            formaPago: 2,
            tipoEntrega: 'Entrega',
            tipoPedido: 'Tipo A',
            estado: 0,
            telefono: 1234567890,
            detalles: [
              {
                id: 101,
                idProducto: 1,
                cantidad: 2,
                precioUnitario: 50,
                total: 100,
                idVariacion: '-1-2',
                productoRel: {
                  id: 1,
                  nombre: 'Producto 1',
                  variantes: [
                    {
                      id: 201,
                      nombre: 'Variante A',
                      variaciones: [
                        { id: 301, nombre: 'Variación X', precioAgregado: 10, disponibilidad: 1 },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ];
  
        // Configurar el mock para que findMany retorne pedidosMock
        prisma.pedido.findMany.mockResolvedValue(pedidosMock);
  
        // Crear mocks para req y res
        const req = {}; // Agrega propiedades si tu controlador las utiliza
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await getPedidos(req, res);
  
        // Verificar que prisma.pedido.findMany fue llamado con los parámetros correctos
        expect(prisma.pedido.findMany).toHaveBeenCalledWith({
          include: {
            detalles: {
              include: {
                productoRel: {
                  include: {
                    variantes: {
                      include: {
                        variaciones: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
  
        // Verificar que res.json fue llamado con los datos mockeados
        expect(res.json).toHaveBeenCalledWith(pedidosMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Configurar el mock para que findMany lance un error cuando se llame
        prisma.pedido.findMany.mockRejectedValue(new Error('Error de base de datos'));
  
        // Crear mocks para req y res
        const req = {};
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await getPedidos(req, res);
  
        // Verificar que prisma.pedido.findMany fue llamado
        expect(prisma.pedido.findMany).toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los pedidos' });
      });
    });
  
    // Test para crearPedido
    describe('crearPedido', () => {
      it('debe crear un nuevo pedido con detalles y emitir un evento', async () => {
        // Datos de ejemplo para el nuevo pedido y sus productos
        const Pedido = {
          cliente: 'Cliente Nuevo',
          productos: [
            { id: '1', cantidad: 2, precio: 50, variacionesSeleccionadas: ['1', '2'] },
            { id: '2', cantidad: 1, precio: 100, variacionesSeleccionadas: ['3'] },
          ],
          localidad: 'Localidad B',
          direccion: 'Dirección 2',
          pagado: '1',
          formaPago: '2',
          tipoEntrega: 'Entrega a Domicilio',
          tipoPedido: 'Tipo B',
          telefono: '0987654321',
        };
  
        // Datos de ejemplo que retornará el mock de Prisma
        const nuevoPedidoMock = {
          id: 2,
          cliente: 'Cliente Nuevo',
          totalProductos: 3,
          fecha: '2023-10-02',
          localidad: 'Localidad B',
          direccion: 'Dirección 2',
          pagado: 1,
          formaPago: 2,
          tipoEntrega: 'Entrega a Domicilio',
          tipoPedido: 'Tipo B',
          estado: 0,
          telefono: 987654321,
          detalles: [
            {
              id: 102,
              idProducto: 1,
              cantidad: 2,
              precioUnitario: 50,
              total: 100,
              idVariacion: '-1-2',
              productoRel: {
                id: 1,
                nombre: 'Producto 1',
                variantes: [
                  {
                    id: 201,
                    nombre: 'Variante A',
                    variaciones: [
                      { id: 301, nombre: 'Variación X', precioAgregado: 10, disponibilidad: 1 },
                    ],
                  },
                ],
              },
            },
            {
              id: 103,
              idProducto: 2,
              cantidad: 1,
              precioUnitario: 100,
              total: 100,
              idVariacion: '-3',
              productoRel: {
                id: 2,
                nombre: 'Producto 2',
                variantes: [
                  {
                    id: 202,
                    nombre: 'Variante B',
                    variaciones: [
                      { id: 302, nombre: 'Variación Y', precioAgregado: 20, disponibilidad: 1 },
                    ],
                  },
                ],
              },
            },
          ],
        };
  
        // Configurar los mocks para parsear el cuerpo de la solicitud
        const req = {
          body: {
            Pedido: JSON.stringify(Pedido),
          },
          files: {
            imagen: {
              tempFilePath: '/path/to/temp/image.jpg',
            },
          },
        };
  
        // Configurar el mock de imageService.subirImagen para retornar datos simulados
        imageService.subirImagen.mockResolvedValue({
          public_id: 'public_id_mock',
          secure_url: 'https://mockurl.com/image.jpg',
        });
  
        // Configurar el mock de prisma.pedido.create para retornar el pedido creado
        prisma.pedido.create.mockResolvedValue(nuevoPedidoMock);
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await crearPedido(req, res);
  
        // Verificar que imageService.subirImagen fue llamado con el path correcto
        expect(imageService.subirImagen).toHaveBeenCalledWith('/path/to/temp/image.jpg');
  
        // Verificar que fs.unlinkSync fue llamado para eliminar el archivo temporal
        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/temp/image.jpg');
  
        // Verificar que prisma.pedido.create fue llamado con los datos correctos
        expect(prisma.pedido.create).toHaveBeenCalledWith({
          data: {
            cliente: Pedido.cliente,
            totalProductos: 3, // Calculado por calcularTotalProductos
            fecha: '2023-10-02', // Calculado por calcularFecha
            localidad: Pedido.localidad,
            direccion: Pedido.direccion,
            pagado: 1, // Parseado de '1'
            formaPago: 2, // Parseado de '2'
            tipoEntrega: Pedido.tipoEntrega,
            tipoPedido: Pedido.tipoPedido,
            estado: 0, // Pendiente
            telefono: 987654321, // Parseado de '0987654321'
            detalles: {
              createMany: {
                data: [
                  {
                    idProducto: 1,
                    cantidad: 2,
                    precioUnitario: 50,
                    total: 100,
                    idVariacion: '-1-2',
                  },
                  {
                    idProducto: 2,
                    cantidad: 1,
                    precioUnitario: 100,
                    total: 100,
                    idVariacion: '-3',
                  },
                ],
              },
            },
          },
          include: {
            detalles: {
              include: {
                productoRel: {
                  include: {
                    variantes: {
                      include: {
                        variaciones: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
  
        // Verificar que io.emit fue llamado con el evento 'nuevo-pedido' y el pedido creado
        expect(io.emit).toHaveBeenCalledWith('nuevo-pedido', nuevoPedidoMock);
  
        // Verificar que res.json fue llamado con el pedido creado
        expect(res.json).toHaveBeenCalledWith(nuevoPedidoMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Configurar el mock para que prisma.pedido.create lance un error
        prisma.pedido.create.mockRejectedValue(new Error('Error al crear el pedido'));
  
        // Datos de ejemplo para el nuevo pedido y sus productos
        const Pedido = {
          cliente: 'Cliente Nuevo',
          productos: [
            { id: '1', cantidad: 2, precio: 50, variacionesSeleccionadas: ['1', '2'] },
          ],
          localidad: 'Localidad B',
          direccion: 'Dirección 2',
          pagado: '1',
          formaPago: '2',
          tipoEntrega: 'Entrega a Domicilio',
          tipoPedido: 'Tipo B',
          telefono: '0987654321',
        };
  
        // Configurar los mocks para parsear el cuerpo de la solicitud
        const req = {
          body: {
            Pedido: JSON.stringify(Pedido),
          },
          files: {
            imagen: {
              tempFilePath: '/path/to/temp/image.jpg',
            },
          },
        };
  
        // Configurar el mock de imageService.subirImagen para retornar datos simulados
        imageService.subirImagen.mockResolvedValue({
          public_id: 'public_id_mock',
          secure_url: 'https://mockurl.com/image.jpg',
        });
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await crearPedido(req, res);
  
        // Verificar que imageService.subirImagen fue llamado con el path correcto
        expect(imageService.subirImagen).toHaveBeenCalledWith('/path/to/temp/image.jpg');
  
        // Verificar que fs.unlinkSync fue llamado para eliminar el archivo temporal
        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/temp/image.jpg');
  
        // Verificar que prisma.pedido.create fue llamado
        expect(prisma.pedido.create).toHaveBeenCalled();
  
        // Verificar que io.emit no fue llamado debido al error
        expect(io.emit).not.toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al crear el pedido' });
      });
    });
  
    // Test para crearPedidoWeb
    describe('crearPedidoWeb', () => {
      it('debe crear un nuevo pedido desde la web y emitir un evento', async () => {
        // Datos de ejemplo para el nuevo pedido desde la web y sus productos
        const Pedido = {
          cliente: 'Cliente Web',
          productos: [
            { id: '3', cantidad: 1, precio: 200, variacionesSeleccionadas: ['4'] },
          ],
          localidad: 'Localidad C',
          direccion: 'Dirección 3',
          formaPago: '1',
          telefono: '1122334455',
        };
  
        // Datos de ejemplo que retornará el mock de Prisma
        const nuevoPedidoWebMock = {
          id: 3,
          cliente: 'Cliente Web',
          totalProductos: 1,
          fecha: '2023-10-03',
          localidad: 'Localidad C',
          direccion: 'Dirección 3',
          pagado: 0,
          formaPago: 1,
          tipoEntrega: 'Recojo en Tienda',
          tipoPedido: 1,
          estado: 0,
          telefono: 1122334455,
          detalles: [
            {
              id: 104,
              idProducto: 3,
              cantidad: 1,
              precioUnitario: 200,
              total: 200,
              idVariacion: '-4',
              productoRel: {
                id: 3,
                nombre: 'Producto 3',
                variantes: [
                  {
                    id: 203,
                    nombre: 'Variante C',
                    variaciones: [
                      { id: 303, nombre: 'Variación Z', precioAgregado: 30, disponibilidad: 1 },
                    ],
                  },
                ],
              },
            },
          ],
        };
  
        // Configurar los mocks para parsear el cuerpo de la solicitud
        const req = {
          body: {
            Pedido: JSON.stringify(Pedido),
          },
        };
  
        // Configurar el mock de prisma.pedido.create para retornar el pedido creado
        prisma.pedido.create.mockResolvedValue(nuevoPedidoWebMock);
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await crearPedidoWeb(req, res);
  
        // Verificar que prisma.pedido.create fue llamado con los datos correctos
        expect(prisma.pedido.create).toHaveBeenCalledWith({
          data: {
            cliente: Pedido.cliente,
            totalProductos: 1, // Calculado por calcularTotalProductos
            fecha: '2023-10-03', // Calculado por calcularFecha
            localidad: Pedido.localidad,
            direccion: Pedido.direccion,
            pagado: 0, // Pagado por defecto en crearPedidoWeb
            formaPago: 1, // Parseado de '1'
            tipoEntrega: Pedido.tipoEntrega,
            tipoPedido: 1, // TipoPedido por defecto en crearPedidoWeb
            estado: 0, // Pendiente
            telefono: 1122334455, // Parseado de '1122334455'
            detalles: {
              createMany: {
                data: [
                  {
                    idProducto: 3,
                    cantidad: 1,
                    precioUnitario: 200,
                    total: 200,
                    idVariacion: '-4',
                  },
                ],
              },
            },
          },
          include: {
            detalles: {
              include: {
                productoRel: {
                  include: {
                    variantes: {
                      include: {
                        variaciones: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
  
        // Verificar que io.emit fue llamado con el evento 'nuevo-pedido' y el pedido creado
        expect(io.emit).toHaveBeenCalledWith('nuevo-pedido', nuevoPedidoWebMock);
  
        // Verificar que res.json fue llamado con el pedido creado
        expect(res.json).toHaveBeenCalledWith(nuevoPedidoWebMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Configurar el mock para que prisma.pedido.create lance un error
        prisma.pedido.create.mockRejectedValue(new Error('Error al crear el pedido web'));
  
        // Datos de ejemplo para el nuevo pedido desde la web y sus productos
        const Pedido = {
          cliente: 'Cliente Web',
          productos: [
            { id: '3', cantidad: 1, precio: 200, variacionesSeleccionadas: ['4'] },
          ],
          localidad: 'Localidad C',
          direccion: 'Dirección 3',
          formaPago: '1',
          telefono: '1122334455',
        };
  
        // Configurar los mocks para parsear el cuerpo de la solicitud
        const req = {
          body: {
            Pedido: JSON.stringify(Pedido),
          },
        };
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await crearPedidoWeb(req, res);
  
        // Verificar que prisma.pedido.create fue llamado
        expect(prisma.pedido.create).toHaveBeenCalled();
  
        // Verificar que io.emit no fue llamado debido al error
        expect(io.emit).not.toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al crear el pedido' });
      });
    });
  
    // Test para cambioEstado
    describe('cambioEstado', () => {
      it('debe actualizar el estado de un pedido y emitir un evento', async () => {
        // Datos de ejemplo para actualizar el estado
        const body = {
          id: '1',
          estado: '1',
        };
  
        // Datos de ejemplo que retornará el mock de Prisma
        const pedidoActualizadoMock = {
          id: 1,
          estado: 1,
        };
  
        // Configurar el mock de prisma.pedido.update para retornar el pedido actualizado
        prisma.pedido.update.mockResolvedValue(pedidoActualizadoMock);
  
        // Crear mocks para req y res
        const req = {
          body: body,
        };
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await cambioEstado(req, res);
  
        // Verificar que prisma.pedido.update fue llamado con los parámetros correctos
        expect(prisma.pedido.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { estado: 1 },
        });
  
        // Verificar que io.emit fue llamado con el evento 'cambioEstado' y el pedido actualizado
        expect(io.emit).toHaveBeenCalledWith('cambioEstado', pedidoActualizadoMock);
  
        // Verificar que res.json fue llamado con el pedido actualizado
        expect(res.json).toHaveBeenCalledWith(pedidoActualizadoMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Configurar el mock para que prisma.pedido.update lance un error
        prisma.pedido.update.mockRejectedValue(new Error('Error al editar el Pedido'));
  
        // Datos de ejemplo para actualizar el estado
        const body = {
          id: '1',
          estado: '1',
        };
  
        // Crear mocks para req y res
        const req = {
          body: body,
        };
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await cambioEstado(req, res);
  
        // Verificar que prisma.pedido.update fue llamado
        expect(prisma.pedido.update).toHaveBeenCalled();
  
        // Verificar que io.emit no fue llamado debido al error
        expect(io.emit).not.toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al editar el Pedido' });
      });
    });
  
    // Test para cambioPagado
    describe('cambioPagado', () => {
      it('debe actualizar el estado de pagado de un pedido', async () => {
        // Datos de ejemplo para actualizar el pagado
        const body = {
          id: '2',
          pagado: '1',
        };
  
        // Datos de ejemplo que retornará el mock de Prisma
        const pedidoActualizadoMock = {
          id: 2,
          pagado: 1,
        };
  
        // Configurar el mock de prisma.pedido.update para retornar el pedido actualizado
        prisma.pedido.update.mockResolvedValue(pedidoActualizadoMock);
  
        // Crear mocks para req y res
        const req = {
          body: body,
        };
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await cambioPagado(req, res);
  
        // Verificar que prisma.pedido.update fue llamado con los parámetros correctos
        expect(prisma.pedido.update).toHaveBeenCalledWith({
          where: { id: 2 },
          data: { pagado: 1 },
        });
  
        // Verificar que res.json fue llamado con el pedido actualizado
        expect(res.json).toHaveBeenCalledWith(pedidoActualizadoMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Configurar el mock para que prisma.pedido.update lance un error
        prisma.pedido.update.mockRejectedValue(new Error('Error al editar el Pedido'));
  
        // Datos de ejemplo para actualizar el pagado
        const body = {
          id: '2',
          pagado: '1',
        };
  
        // Crear mocks para req y res
        const req = {
          body: body,
        };
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await cambioPagado(req, res);
  
        // Verificar que prisma.pedido.update fue llamado
        expect(prisma.pedido.update).toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al editar el Pedido' });
      });
    });
  });
  