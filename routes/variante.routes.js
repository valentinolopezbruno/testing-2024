const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const varianteController = require("../controllers/variante.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.post("/api/variante/editar", varianteController.editarVariante);
router.post("/api/variante/eliminar", varianteController.eliminarVariante);

module.exports = router;