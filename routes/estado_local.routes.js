const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const estado_localController = require("../controllers/estado_local.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.get("/api/estado_local", estado_localController.getEstado);
router.post("/api/estado_local/editar", estado_localController.editarEstadoLocal);



module.exports = router;