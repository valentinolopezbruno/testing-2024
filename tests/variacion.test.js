jest.mock('../prisma/client', () => ({
    variacion: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }));
  
  // Importar el controlador después de mockear Prisma
  const {
    getVariaciones,
    editarVariacion,
    eliminarVariacion,
  } = require('../controllers/variacion.controller');
  
  const prisma = require('../prisma/client');
  
  describe('Variaciones Controller', () => {
    // Limpiar los mocks después de cada prueba para evitar interferencias entre tests
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Test para getVariaciones
    describe('getVariaciones', () => {
      it('debe retornar una lista de variaciones', async () => {
        // Datos de ejemplo que retornará el mock de Prisma
        const variacionesMock = [
          {
            id: 1,
            nombre: 'Variación A',
            precioAgregado: 10,
            disponibilidad: 1,
          },
          {
            id: 2,
            nombre: 'Variación B',
            precioAgregado: 15,
            disponibilidad: 0,
          },
        ];
  
        // Configurar el mock para que findMany retorne variacionesMock
        prisma.variacion.findMany.mockResolvedValue(variacionesMock);
  
        // Crear mocks para req y res
        const req = {}; // Agrega propiedades si tu controlador las utiliza
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await getVariaciones(req, res);
  
        // Verificar que prisma.variacion.findMany fue llamado con los parámetros correctos
        expect(prisma.variacion.findMany).toHaveBeenCalledWith({});
  
        // Verificar que res.json fue llamado con los datos mockeados
        expect(res.json).toHaveBeenCalledWith(variacionesMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Configurar el mock para que findMany lance un error cuando se llame
        prisma.variacion.findMany.mockRejectedValue(new Error('Error de base de datos'));
  
        // Crear mocks para req y res
        const req = {};
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await getVariaciones(req, res);
  
        // Verificar que prisma.variacion.findMany fue llamado
        expect(prisma.variacion.findMany).toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo obtener las variaciones.' });
      });
    });
  
    // Test para editarVariacion
    describe('editarVariacion', () => {
      it('debe actualizar una variación existente correctamente', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '1',
            nuevaVariacion: {
              nombre: 'Variación Actualizada',
              precioAgregado: 20,
              disponibilidad: 1,
            },
          },
        };
  
        // Datos de ejemplo que retornará el mock de Prisma
        const variacionActualizadaMock = {
          id: 1,
          nombre: 'Variación Actualizada',
          precioAgregado: 20,
          disponibilidad: 1,
        };
  
        // Configurar el mock de prisma.variacion.update para retornar la variación actualizada
        prisma.variacion.update.mockResolvedValue(variacionActualizadaMock);
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await editarVariacion(req, res);
  
        // Verificar que prisma.variacion.update fue llamado con los parámetros correctos
        expect(prisma.variacion.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: {
            nombre: 'Variación Actualizada',
            precioAgregado: 20,
            disponibilidad: 1,
          },
        });
  
        // Verificar que res.json fue llamado con la variación actualizada
        expect(res.json).toHaveBeenCalledWith(variacionActualizadaMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '1',
            nuevaVariacion: {
              nombre: 'Variación Actualizada',
              precioAgregado: 20,
              disponibilidad: 1,
            },
          },
        };
  
        // Configurar el mock para que prisma.variacion.update lance un error
        prisma.variacion.update.mockRejectedValue(new Error('Error al actualizar la variación'));
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await editarVariacion(req, res);
  
        // Verificar que prisma.variacion.update fue llamado
        expect(prisma.variacion.update).toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo actualizar la variacion.' });
      });
    });
  
    // Test para eliminarVariacion
    describe('eliminarVariacion', () => {
      it('debe eliminar una variación correctamente', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '2',
          },
        };
  
        // Configurar el mock de prisma.variacion.delete para simular la eliminación
        prisma.variacion.delete.mockResolvedValue({
          id: 2,
          nombre: 'Variación a Eliminar',
          precioAgregado: 15,
          disponibilidad: 0,
        });
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await eliminarVariacion(req, res);
  
        // Verificar que prisma.variacion.delete fue llamado con los parámetros correctos
        expect(prisma.variacion.delete).toHaveBeenCalledWith({
          where: { id: 2 },
        });
  
        // Verificar que res.json fue llamado con el mensaje de éxito
        expect(res.json).toHaveBeenCalledWith({ message: 'Variación eliminada correctamente.' });
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '2',
          },
        };
  
        // Configurar el mock para que prisma.variacion.delete lance un error
        prisma.variacion.delete.mockRejectedValue(new Error('Error al eliminar la variación'));
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await eliminarVariacion(req, res);
  
        // Verificar que prisma.variacion.delete fue llamado
        expect(prisma.variacion.delete).toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo eliminar la variación.' });
      });
    });
  });
  