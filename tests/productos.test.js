jest.mock('../prisma/client', () => ({
  producto: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  variante: {
    update: jest.fn(),
    create: jest.fn(),
  },
  variacion: {
    update: jest.fn(),
    create: jest.fn(),
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

// Importar el controlador después de mockear Prisma y otras dependencias
const {
  getProductos,
  getProductosDisponibles,
  crearProducto,
  editarProducto,
  cambioDisponibilidad,
  eliminarProducto,
  cambioEstadoDisponible,
} = require('../controllers/producto.controller');

const prisma = require('../prisma/client');
const imageService = require('../cloudinary');
const fs = require('fs-extra');

describe('Productos Controller', () => {
  // Limpiar los mocks después de cada prueba para evitar interferencias entre tests
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test para getProductos
  describe('getProductos', () => {
    it('debe retornar una lista de productos', async () => {
      // Datos de ejemplo que retornará el mock de Prisma
      const productosMock = [
        {
          id: 1,
          nombre: 'Producto 1',
          variantes: [
            {
              id: 101,
              nombre: 'Variante A',
              variaciones: [
                { id: 1001, detalle: 'Variación X' },
                { id: 1002, detalle: 'Variación Y' },
              ],
            },
          ],
        },
      ];

      // Configurar el mock para que findMany retorne productosMock
      prisma.producto.findMany.mockResolvedValue(productosMock);

      // Crear mocks para req y res
      const req = {}; // Agrega propiedades si tu controlador las utiliza
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await getProductos(req, res);

      // Verificar que prisma.producto.findMany fue llamado con los parámetros correctos
      expect(prisma.producto.findMany).toHaveBeenCalledWith({
        include: {
          variantes: {
            include: {
              variaciones: true,
            },
          },
        },
      });

      // Verificar que res.json fue llamado con los datos mockeados
      expect(res.json).toHaveBeenCalledWith(productosMock);
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que findMany lance un error cuando se llame
      prisma.producto.findMany.mockRejectedValue(new Error('Error de base de datos'));

      // Crear mocks para req y res
      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await getProductos(req, res);

      // Verificar que prisma.producto.findMany fue llamado
      expect(prisma.producto.findMany).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los productos' });
    });
  });

  // Test para getProductosDisponibles
  describe('getProductosDisponibles', () => {
    it('debe retornar una lista de productos disponibles', async () => {
      // Datos de ejemplo que retornará el mock de Prisma
      const productosDisponiblesMock = [
        {
          id: 2,
          nombre: 'Producto 2',
          disponibilidad: 0,
          variantes: [
            {
              id: 102,
              nombre: 'Variante B',
              variaciones: [
                { id: 1003, detalle: 'Variación Z' },
                { id: 1004, detalle: 'Variación W' },
              ],
            },
          ],
        },
      ];

      // Configurar el mock para que findMany retorne productosDisponiblesMock
      prisma.producto.findMany.mockResolvedValue(productosDisponiblesMock);

      // Crear mocks para req y res
      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await getProductosDisponibles(req, res);

      // Verificar que prisma.producto.findMany fue llamado con los parámetros correctos
      expect(prisma.producto.findMany).toHaveBeenCalledWith({
        where: {
          disponibilidad: 0,
        },
        include: {
          variantes: {
            include: {
              variaciones: true,
            },
          },
        },
      });

      // Verificar que res.json fue llamado con los datos mockeados
      expect(res.json).toHaveBeenCalledWith(productosDisponiblesMock);
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que findMany lance un error cuando se llame
      prisma.producto.findMany.mockRejectedValue(new Error('Error de base de datos'));

      // Crear mocks para req y res
      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await getProductosDisponibles(req, res);

      // Verificar que prisma.producto.findMany fue llamado
      expect(prisma.producto.findMany).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los productos disponibles' });
    });
  });

  // Test para crearProducto
  describe('crearProducto', () => {
    it('debe crear un nuevo producto con variantes y variaciones', async () => {
      // Datos de ejemplo para el nuevo producto y sus variantes
      const nuevoProducto = {
        nombre: 'Nuevo Producto',
        precio: 100,
        descripcion: 'Descripción del nuevo producto',
        formatoVenta: 'Unitario',
        idCategoria: 1,
        promocion: true,
        precio_promocion: 80,
      };

      const variantes = [
        {
          nombre: 'Variante C',
          variaciones: [
            { nombre: 'Variación A1', precioAgregado: 10, disponibilidad: 1 },
            { nombre: 'Variación A2', precioAgregado: 15, disponibilidad: 1 },
          ],
        },
      ];

      // Configurar los mocks para parsear el cuerpo de la solicitud
      const req = {
        body: {
          nuevoProducto: JSON.stringify(nuevoProducto),
          variantes: JSON.stringify(variantes),
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

      // Configurar el mock de prisma.producto.create para retornar el producto creado
      const productoCreadoMock = {
        id: 3,
        ...nuevoProducto,
        imagen: 'https://mockurl.com/image.jpg',
        public_id: 'public_id_mock',
        variantes: [
          {
            id: 201,
            nombre: 'Variante C',
            variaciones: [
              { id: 3001, nombre: 'Variación A1', precioAgregado: 10, disponibilidad: 1 },
              { id: 3002, nombre: 'Variación A2', precioAgregado: 15, disponibilidad: 1 },
            ],
          },
        ],
      };

      prisma.producto.create.mockResolvedValue(productoCreadoMock);

      // Crear mocks para res
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await crearProducto(req, res);

      // Verificar que imageService.subirImagen fue llamado con el path correcto
      expect(imageService.subirImagen).toHaveBeenCalledWith('/path/to/temp/image.jpg');

      // Verificar que fs.unlinkSync fue llamado para eliminar el archivo temporal
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/temp/image.jpg');

      // Verificar que prisma.producto.create fue llamado con los datos correctos
      expect(prisma.producto.create).toHaveBeenCalledWith({
        data: {
          nombre: nuevoProducto.nombre,
          precio: nuevoProducto.precio,
          descripcion: nuevoProducto.descripcion,
          imagen: productoCreadoMock.imagen,
          public_id: productoCreadoMock.public_id,
          formatoVenta: nuevoProducto.formatoVenta,
          disponibilidad: 0,
          idCategoria: nuevoProducto.idCategoria,
          promocion: nuevoProducto.promocion,
          precio_promocion: nuevoProducto.precio_promocion,
          estado: 0,
          variantes: {
            create: variantes.map(variante => ({
              nombre: variante.nombre,
              variaciones: {
                create: variante.variaciones.map(variacion => ({
                  nombre: variacion.nombre,
                  precioAgregado: variacion.precioAgregado,
                  disponibilidad: variacion.disponibilidad,
                })),
              },
            })),
          },
        },
        include: {
          variantes: {
            include: {
              variaciones: true,
            },
          },
        },
      });

      // Verificar que res.json fue llamado con el producto creado
      expect(res.json).toHaveBeenCalledWith(productoCreadoMock);
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que prisma.producto.create lance un error
      prisma.producto.create.mockRejectedValue(new Error('Error al crear el producto'));

      // Datos de ejemplo para el nuevo producto y sus variantes
      const nuevoProducto = {
        nombre: 'Nuevo Producto',
        precio: 100,
        descripcion: 'Descripción del nuevo producto',
        formatoVenta: 'Unitario',
        idCategoria: 1,
        promocion: true,
        precio_promocion: 80,
      };

      const variantes = [
        {
          nombre: 'Variante C',
          variaciones: [
            { nombre: 'Variación A1', precioAgregado: 10, disponibilidad: 1 },
            { nombre: 'Variación A2', precioAgregado: 15, disponibilidad: 1 },
          ],
        },
      ];

      // Configurar los mocks para parsear el cuerpo de la solicitud
      const req = {
        body: {
          nuevoProducto: JSON.stringify(nuevoProducto),
          variantes: JSON.stringify(variantes),
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
      await crearProducto(req, res);

      // Verificar que imageService.subirImagen fue llamado con el path correcto
      expect(imageService.subirImagen).toHaveBeenCalledWith('/path/to/temp/image.jpg');

      // Verificar que fs.unlinkSync fue llamado para eliminar el archivo temporal
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/temp/image.jpg');

      // Verificar que prisma.producto.create fue llamado
      expect(prisma.producto.create).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al crear el producto, variantes y variaciones' });
    });
  });

  // Test para editarProducto
  describe('editarProducto', () => {
    it('debe editar un producto existente y sus variantes', async () => {
      // Datos de ejemplo para el producto y variantes a editar
      const nuevoProducto = {
        id: 1,
        nombre: 'Producto Editado',
        precio: 150,
        descripcion: 'Descripción editada',
        formatoVenta: 'Paquete',
        promocion: false,
        precio_promocion: 0,
        imagen: 'https://mockurl.com/old_image.jpg',
        public_id: 'old_public_id',
        idCategoria: 2,
      };

      const variantes = [
        {
          id: 101,
          nombre: 'Variante Editada',
          variaciones: [
            { id: 1001, nombre: 'Variación Editada A1', precioAgregado: 20, disponibilidad: 1 },
            { nombre: 'Variación Nueva A2', precioAgregado: 25, disponibilidad: 1 }, // Nueva variación
          ],
        },
        {
          nombre: 'Nueva Variante B',
          variaciones: [
            { nombre: 'Variación B1', precioAgregado: 30, disponibilidad: 1 },
          ],
        },
      ];

      // Configurar los mocks para parsear el cuerpo de la solicitud
      const req = {
        body: {
          nuevoProducto: JSON.stringify(nuevoProducto),
          variantes: JSON.stringify(variantes),
        },
        files: {
          imagen: {
            tempFilePath: '/path/to/temp/new_image.jpg',
          },
        },
      };

      // Configurar el mock de imageService.subirImagen para retornar datos simulados
      imageService.subirImagen.mockResolvedValue({
        public_id: 'new_public_id',
        secure_url: 'https://mockurl.com/new_image.jpg',
      });

      // Configurar el mock de imageService.eliminarImagen para simular eliminación
      imageService.eliminarImagen.mockResolvedValue(true);

      // Configurar el mock de prisma.producto.update para retornar el producto actualizado
      const productoActualizadoMock = {
        id: 1,
        ...nuevoProducto,
        imagen: 'https://mockurl.com/new_image.jpg',
        public_id: 'new_public_id',
      };

      prisma.producto.update.mockResolvedValue(productoActualizadoMock);

      // Configurar los mocks para actualizar y crear variantes y variaciones
      const varianteActualizadaMock = {
        id: 101,
        nombre: 'Variante Editada',
      };

      const variacionActualizadaMock = {
        id: 1001,
        nombre: 'Variación Editada A1',
        precioAgregado: 20,
        disponibilidad: 1,
      };

      const variacionNuevaMock = {
        id: 1005,
        nombre: 'Variación Nueva A2',
        precioAgregado: 25,
        disponibilidad: 1,
      };

      const nuevaVarianteMock = {
        id: 102,
        nombre: 'Nueva Variante B',
      };

      const variacionB1Mock = {
        id: 1006,
        nombre: 'Variación B1',
        precioAgregado: 30,
        disponibilidad: 1,
      };

      prisma.variante.update.mockResolvedValue(varianteActualizadaMock);
      prisma.variante.create.mockResolvedValue(nuevaVarianteMock);
      prisma.variacion.update.mockResolvedValue(variacionActualizadaMock);
      prisma.variacion.create.mockResolvedValue(variacionNuevaMock);
      prisma.variacion.create.mockResolvedValue(variacionB1Mock); // Para la nueva variante

      // Configurar el mock de prisma.producto.findFirst para retornar el producto estructurado
      const productoEstructuradoMock = {
        id: 1,
        nombre: 'Producto Editado',
        precio: 150,
        descripcion: 'Descripción editada',
        formatoVenta: 'Paquete',
        promocion: false,
        precio_promocion: 0,
        imagen: 'https://mockurl.com/new_image.jpg',
        public_id: 'new_public_id',
        idCategoria: 2,
        variantes: [
          {
            id: 101,
            nombre: 'Variante Editada',
            variaciones: [
              { id: 1001, nombre: 'Variación Editada A1', precioAgregado: 20, disponibilidad: 1 },
              { id: 1005, nombre: 'Variación Nueva A2', precioAgregado: 25, disponibilidad: 1 },
            ],
          },
          {
            id: 102,
            nombre: 'Nueva Variante B',
            variaciones: [
              { id: 1006, nombre: 'Variación B1', precioAgregado: 30, disponibilidad: 1 },
            ],
          },
        ],
      };

      prisma.producto.findFirst.mockResolvedValue(productoEstructuradoMock);

      // Crear mocks para res
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await editarProducto(req, res);

      // Verificar que imageService.subirImagen fue llamado con el path correcto
      expect(imageService.subirImagen).toHaveBeenCalledWith('/path/to/temp/new_image.jpg');

      // Verificar que imageService.eliminarImagen fue llamado con el public_id antiguo
      expect(imageService.eliminarImagen).toHaveBeenCalledWith('old_public_id');

      // Verificar que fs.unlinkSync fue llamado para eliminar el archivo temporal
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/temp/new_image.jpg');

      // Verificar que prisma.producto.update fue llamado con los datos correctos
      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: nuevoProducto.id },
        data: {
          idCategoria: nuevoProducto.idCategoria,
          nombre: nuevoProducto.nombre,
          precio: nuevoProducto.precio,
          descripcion: nuevoProducto.descripcion,
          formatoVenta: nuevoProducto.formatoVenta,
          imagen: productoActualizadoMock.imagen,
          public_id: productoActualizadoMock.public_id,
          promocion: nuevoProducto.promocion,
          precio_promocion: nuevoProducto.precio_promocion,
        },
      });

      // Verificar que prisma.variante.update fue llamado con los datos correctos
      expect(prisma.variante.update).toHaveBeenCalledWith({
        where: { id: 101 },
        data: { nombre: 'Variante Editada' },
      });

      // Verificar que prisma.variacion.update fue llamado con los datos correctos
      expect(prisma.variacion.update).toHaveBeenCalledWith({
        where: { id: 1001 },
        data: {
          nombre: 'Variación Editada A1',
          precioAgregado: 20,
          disponibilidad: 1,
        },
      });

      // Verificar que prisma.variacion.create fue llamado para la nueva variación A2
      expect(prisma.variacion.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Variación Nueva A2',
          precioAgregado: 25,
          disponibilidad: 1,
          idVariante: 101,
        },
      });

      // Verificar que prisma.variante.create fue llamado para la nueva variante B
      expect(prisma.variante.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Nueva Variante B',
          idProducto: 1,
          variaciones: {
            create: [
              {
                nombre: 'Variación B1',
                precioAgregado: 30,
                disponibilidad: 1,
              },
            ],
          },
        },
      });

      // Verificar que prisma.variacion.create fue llamado para la variación B1
      expect(prisma.variacion.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Variación B1',
          precioAgregado: 30,
          disponibilidad: 1,
          idVariante: 102,
        },
      });

      // Verificar que prisma.producto.findFirst fue llamado para obtener el producto estructurado
      expect(prisma.producto.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          variantes: {
            include: {
              variaciones: true,
            },
          },
        },
      });

      // Verificar que res.json fue llamado con el producto estructurado
      expect(res.json).toHaveBeenCalledWith({ producto: productoEstructuradoMock });
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que prisma.producto.update lance un error
      prisma.producto.update.mockRejectedValue(new Error('Error al actualizar el producto'));

      // Datos de ejemplo para el producto y variantes a editar
      const nuevoProducto = {
        id: 1,
        nombre: 'Producto Editado',
        precio: 150,
        descripcion: 'Descripción editada',
        formatoVenta: 'Paquete',
        promocion: false,
        precio_promocion: 0,
        imagen: 'https://mockurl.com/old_image.jpg',
        public_id: 'old_public_id',
        idCategoria: 2,
      };

      const variantes = [
        {
          id: 101,
          nombre: 'Variante Editada',
          variaciones: [
            { id: 1001, nombre: 'Variación Editada A1', precioAgregado: 20, disponibilidad: 1 },
            { nombre: 'Variación Nueva A2', precioAgregado: 25, disponibilidad: 1 }, // Nueva variación
          ],
        },
      ];

      // Configurar los mocks para parsear el cuerpo de la solicitud
      const req = {
        body: {
          nuevoProducto: JSON.stringify(nuevoProducto),
          variantes: JSON.stringify(variantes),
        },
        files: {
          imagen: {
            tempFilePath: '/path/to/temp/new_image.jpg',
          },
        },
      };

      // Configurar el mock de imageService.subirImagen para retornar datos simulados
      imageService.subirImagen.mockResolvedValue({
        public_id: 'new_public_id',
        secure_url: 'https://mockurl.com/new_image.jpg',
      });

      // Crear mocks para res
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await editarProducto(req, res);

      // Verificar que imageService.subirImagen fue llamado con el path correcto
      expect(imageService.subirImagen).toHaveBeenCalledWith('/path/to/temp/new_image.jpg');

      // Verificar que imageService.eliminarImagen fue llamado con el public_id antiguo
      expect(imageService.eliminarImagen).toHaveBeenCalledWith('old_public_id');

      // Verificar que fs.unlinkSync fue llamado para eliminar el archivo temporal
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/temp/new_image.jpg');

      // Verificar que prisma.producto.update fue llamado
      expect(prisma.producto.update).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar el producto y sus variantes' });
    });
  });

  // Test para cambioDisponibilidad
  describe('cambioDisponibilidad', () => {
    it('debe actualizar la disponibilidad de un producto', async () => {
      // Datos de ejemplo para actualizar la disponibilidad
      const datosProducto = {
        id: 1,
        disponibilidad: 1,
      };

      // Configurar el mock de prisma.producto.update para retornar el producto actualizado
      const productoActualizadoMock = {
        id: 1,
        disponibilidad: 1,
      };

      prisma.producto.update.mockResolvedValue(productoActualizadoMock);

      // Crear mocks para req y res
      const req = {
        body: datosProducto,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await cambioDisponibilidad(req, res);

      // Verificar que prisma.producto.update fue llamado con los parámetros correctos
      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: datosProducto.id },
        data: { disponibilidad: datosProducto.disponibilidad },
      });

      // Verificar que res.status fue llamado con el código 200
      expect(res.status).toHaveBeenCalledWith(200);

      // Verificar que res.json fue llamado con el mensaje y producto actualizado
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Producto actualizado correctamente',
        producto: productoActualizadoMock,
      });
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que prisma.producto.update lance un error
      prisma.producto.update.mockRejectedValue(new Error('Error al editar el producto'));

      // Datos de ejemplo para actualizar la disponibilidad
      const datosProducto = {
        id: 1,
        disponibilidad: 1,
      };

      // Crear mocks para req y res
      const req = {
        body: datosProducto,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await cambioDisponibilidad(req, res);

      // Verificar que prisma.producto.update fue llamado
      expect(prisma.producto.update).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al editar el producto' });
    });
  });

  // Test para eliminarProducto
  describe('eliminarProducto', () => {
    it('debe deshabilitar un producto cambiando su disponibilidad y estado', async () => {
      // Datos de ejemplo para deshabilitar el producto
      const datosProducto = {
        id: 1,
      };

      // Configurar el mock de prisma.producto.update para retornar el producto actualizado
      const productoActualizadoMock = {
        id: 1,
        disponibilidad: 1,
        estado: 1,
      };

      prisma.producto.update.mockResolvedValue(productoActualizadoMock);

      // Crear mocks para req y res
      const req = {
        body: datosProducto,
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await eliminarProducto(req, res);

      // Verificar que prisma.producto.update fue llamado con los parámetros correctos
      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: datosProducto.id },
        data: { disponibilidad: 1, estado: 1 },
      });

      // Verificar que res.json fue llamado con el producto actualizado
      expect(res.json).toHaveBeenCalledWith(productoActualizadoMock);
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que prisma.producto.update lance un error
      prisma.producto.update.mockRejectedValue(new Error('Error al editar el producto'));

      // Datos de ejemplo para deshabilitar el producto
      const datosProducto = {
        id: 1,
      };

      // Crear mocks para req y res
      const req = {
        body: datosProducto,
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await eliminarProducto(req, res);

      // Verificar que prisma.producto.update fue llamado
      expect(prisma.producto.update).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al editar el producto' });
    });
  });

  // Test para cambioEstadoDisponible
  describe('cambioEstadoDisponible', () => {
    it('debe actualizar el estado de disponibilidad de un producto', async () => {
      // Datos de ejemplo para actualizar el estado
      const datosProducto = {
        id: 1,
        estado: 0,
      };

      // Configurar el mock de prisma.producto.update para retornar el producto actualizado
      const productoActualizadoMock = {
        id: 1,
        estado: 0,
      };

      prisma.producto.update.mockResolvedValue(productoActualizadoMock);

      // Crear mocks para req y res
      const req = {
        body: datosProducto,
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await cambioEstadoDisponible(req, res);

      // Verificar que prisma.producto.update fue llamado con los parámetros correctos
      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: datosProducto.id },
        data: { estado: datosProducto.estado },
      });

      // Verificar que res.json fue llamado con el producto actualizado
      expect(res.json).toHaveBeenCalledWith(productoActualizadoMock);
    });

    it('debe manejar errores y retornar un status 500', async () => {
      // Configurar el mock para que prisma.producto.update lance un error
      prisma.producto.update.mockRejectedValue(new Error('Error al editar el producto'));

      // Datos de ejemplo para actualizar el estado
      const datosProducto = {
        id: 1,
        estado: 0,
      };

      // Crear mocks para req y res
      const req = {
        body: datosProducto,
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      // Ejecutar el controlador con los mocks de req y res
      await cambioEstadoDisponible(req, res);

      // Verificar que prisma.producto.update fue llamado
      expect(prisma.producto.update).toHaveBeenCalled();

      // Verificar que res.status fue llamado con el código 500
      expect(res.status).toHaveBeenCalledWith(500);

      // Verificar que res.json fue llamado con el mensaje de error adecuado
      expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error al editar el producto' });
    });
  });
});
