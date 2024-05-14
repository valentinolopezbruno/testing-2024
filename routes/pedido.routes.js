const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const pedidoController = require("../controllers/pedido.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.get("/api/pedido", pedidoController.getPedidos);
router.post("/api/pedido", pedidoController.crearPedido);
router.post("/api/pedido/cambiarEstado", pedidoController.cambioEstado);


module.exports = router;