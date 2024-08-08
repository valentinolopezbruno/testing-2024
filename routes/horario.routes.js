const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const horarioController = require("../controllers/horario.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.get("/api/horario", horarioController.getHorarios);
router.post("/api/horario", horarioController.crearHorario);
router.post("/api/horarioBorrar", horarioController.eliminarHorario);
router.post("/api/horarioActualizar", horarioController.actualizarHorario);






module.exports = router;