const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const detallePedidoController = require("../controllers/detallePedido.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.post("/api/detallePedidoBorrar", detallePedidoController.eliminarDetalle);



module.exports = router;