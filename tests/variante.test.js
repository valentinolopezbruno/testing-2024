jest.mock('../prisma/client', () => ({
    variante: {
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  }));
  
  // Mockear io si es utilizado en el controlador (opcional)
  // jest.mock('../app', () => ({
  //   emit: jest.fn(),
  // }));
  
  // Importar el controlador después de mockear Prisma y otras dependencias
  const {
    editarVariante,
    eliminarVariante,
  } = require('../controllers/variante.controller');
  
  const prisma = require('../prisma/client');
  // const io = require('../app'); // Solo si utilizas io en tus controladores
  
  describe('Variantes Controller', () => {
    // Limpiar los mocks después de cada prueba para evitar interferencias entre tests
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Test para editarVariante
    describe('editarVariante', () => {
      it('debe actualizar una variante existente correctamente', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '1',
            nombre: 'Variante Actualizada',
          },
        };
  
        // Datos de ejemplo que retornará el mock de Prisma
        const varianteActualizadaMock = {
          id: 1,
          nombre: 'Variante Actualizada',
          precioAgregado: 20,
          disponibilidad: 1,
        };
  
        // Configurar el mock de prisma.variante.update para retornar la variante actualizada
        prisma.variante.update.mockResolvedValue(varianteActualizadaMock);
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await editarVariante(req, res);
  
        // Verificar que prisma.variante.update fue llamado con los parámetros correctos
        expect(prisma.variante.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { nombre: 'Variante Actualizada' },
        });
  
        // Verificar que res.json fue llamado con la variante actualizada
        expect(res.json).toHaveBeenCalledWith(varianteActualizadaMock);
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '1',
            nombre: 'Variante Actualizada',
          },
        };
  
        // Configurar el mock para que prisma.variante.update lance un error
        prisma.variante.update.mockRejectedValue(new Error('Error al actualizar la variante'));
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await editarVariante(req, res);
  
        // Verificar que prisma.variante.update fue llamado
        expect(prisma.variante.update).toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo actualizar la variante.' });
      });
    });
  
    // Test para eliminarVariante
    describe('eliminarVariante', () => {
      it('debe eliminar una variante y sus variaciones correctamente', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '2',
          },
        };
  
        // Configurar el mock de prisma.variacion.deleteMany para simular la eliminación de variaciones
        prisma.variacion.deleteMany.mockResolvedValue({ count: 3 });
  
        // Configurar el mock de prisma.variante.delete para simular la eliminación de la variante
        prisma.variante.delete.mockResolvedValue({
          id: 2,
          nombre: 'Variante a Eliminar',
        });
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await eliminarVariante(req, res);
  
        // Verificar que prisma.variacion.deleteMany fue llamado con los parámetros correctos
        expect(prisma.variacion.deleteMany).toHaveBeenCalledWith({
          where: { idVariante: 2 },
        });
  
        // Verificar que prisma.variante.delete fue llamado con los parámetros correctos
        expect(prisma.variante.delete).toHaveBeenCalledWith({
          where: { id: 2 },
        });
  
        // Verificar que res.json fue llamado con el mensaje de éxito
        expect(res.json).toHaveBeenCalledWith({ message: 'Variante y todas sus variaciones eliminadas correctamente.' });
      });
  
      it('debe manejar errores y retornar un status 500', async () => {
        // Datos de ejemplo para la solicitud
        const req = {
          body: {
            id: '2',
          },
        };
  
        // Configurar el mock para que prisma.variacion.deleteMany lance un error
        prisma.variacion.deleteMany.mockRejectedValue(new Error('Error al eliminar las variaciones'));
  
        // Crear mocks para res
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        };
  
        // Ejecutar el controlador con los mocks de req y res
        await eliminarVariante(req, res);
  
        // Verificar que prisma.variacion.deleteMany fue llamado
        expect(prisma.variacion.deleteMany).toHaveBeenCalled();
  
        // Verificar que prisma.variante.delete no fue llamado debido al error
        expect(prisma.variante.delete).not.toHaveBeenCalled();
  
        // Verificar que res.status fue llamado con el código 500
        expect(res.status).toHaveBeenCalledWith(500);
  
        // Verificar que res.json fue llamado con el mensaje de error adecuado
        expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo eliminar la variante.' });
      });
    });
  });
  