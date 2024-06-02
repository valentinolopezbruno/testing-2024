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
  

  exports.pedidosDia = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el conteo de pedidos
      const resultado = await prisma.$queryRaw`
        SELECT COUNT(*) AS totalPedidos
        FROM pedido AS PE
        WHERE PE.estado = 1 
          AND DATE(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = CURDATE();
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalPedidos del primer objeto
      const totalPedidos = resultado[0]?.totalPedidos ? Number(resultado[0].totalPedidos) : 0; // Si no hay pedidos, retorna 0
  
      res.json(totalPedidos );
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  exports.pedidosMes = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el conteo de pedidos
      const resultado = await prisma.$queryRaw`
        SELECT COUNT(*) AS totalPedidos
        FROM pedido AS PE
        WHERE PE.estado = 1 
          AND MONTH(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = MONTH(CURDATE())
          AND YEAR(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = YEAR(CURDATE());
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalPedidos del primer objeto
      const totalPedidos = resultado[0]?.totalPedidos ? Number(resultado[0].totalPedidos) : 0; // Si no hay pedidos, retorna 0
  
      res.json(totalPedidos );
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  exports.pedidosAnio = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el conteo de pedidos
      const resultado = await prisma.$queryRaw`
        SELECT COUNT(*) AS totalPedidos
        FROM pedido AS PE
        WHERE PE.estado = 1 
          AND YEAR(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = YEAR(CURDATE());
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalPedidos del primer objeto
      const totalPedidos = resultado[0]?.totalPedidos ? Number(resultado[0].totalPedidos) : 0; // Si no hay pedidos, retorna 0
  
      res.json(totalPedidos );
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  

  exports.sumarPedidosOnline = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el valor sumado
      const resultado = await prisma.$queryRaw`
        SELECT SUM(DP.total) AS totalTipo1
        FROM detallePedido AS DP
        JOIN pedido AS PE ON DP.idPedido = PE.id
        WHERE PE.estado = 1 
          AND PE.tipoPedido = 1
          AND DATE(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = CURDATE();
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalTipo1 del primer objeto
      const totalTipo1 = resultado[0]?.totalTipo1 ? Number(resultado[0].totalTipo1) : 0;
  
      res.json(totalTipo1 );
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  exports.sumarPedidosLocal = async (req, res) => {
    try {
      // Ejecuta la consulta y extrae directamente el valor sumado
      const resultado = await prisma.$queryRaw`
        SELECT SUM(DP.total) AS totalTipo0
        FROM detallePedido AS DP
        JOIN pedido AS PE ON DP.idPedido = PE.id
        WHERE PE.estado = 1 
          AND PE.tipoPedido = 0
          AND DATE(STR_TO_DATE(PE.fecha, '%m/%d/%Y')) = CURDATE();
      `;
      
      // Dado que $queryRaw podría devolver un arreglo de objetos, extrae el valor de totalTipo0 del primer objeto
      const totalTipo0 = resultado[0]?.totalTipo0 ? Number(resultado[0].totalTipo0) : 0;
  
      res.json(totalTipo0 );
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  