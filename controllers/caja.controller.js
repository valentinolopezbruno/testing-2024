const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.ventaDia = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el valor sumado
      const resultado = await prisma.$queryRaw`
        SELECT SUM(DP.total) AS totalVentas
        FROM detallePedido AS DP
        JOIN pedido AS PE ON DP.idPedido = PE.id
        WHERE PE.estado = 1 AND DATE(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = CURDATE();
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalVentas del primer objeto
      const totalVentas = resultado[0]?.totalVentas || 0; // Si no hay ventas, retorna 0
  
      res.json(totalVentas);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  


  exports.ventaMes = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el valor sumado
      const resultado = await prisma.$queryRaw`
        SELECT SUM(DP.total) AS totalVentas
        FROM detallePedido AS DP
        JOIN pedido AS PE ON DP.idPedido = PE.id
        WHERE PE.estado = 1 
          AND MONTH(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = MONTH(CURDATE())
          AND YEAR(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = YEAR(CURDATE());
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalVentas del primer objeto
      const totalVentas = resultado[0]?.totalVentas || 0; // Si no hay ventas, retorna 0
  
      res.json(totalVentas);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  

  exports.ventaAnual = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el valor sumado
      const resultado = await prisma.$queryRaw`
        SELECT SUM(DP.total) AS totalVentas
        FROM detallePedido AS DP
        JOIN pedido AS PE ON DP.idPedido = PE.id
        WHERE PE.estado = 1 
          AND YEAR(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = YEAR(CURDATE());
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalVentas del primer objeto
      const totalVentas = resultado[0]?.totalVentas || 0; // Si no hay ventas, retorna 0
  
      res.json(totalVentas);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  





