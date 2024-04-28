const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const variacionController = require("../controllers/variacion.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.post("/api/variacion/editar", variacionController.editarVariacion);
router.post("/api/variacion/eliminar", variacionController.eliminarVariacion);

module.exports = router;