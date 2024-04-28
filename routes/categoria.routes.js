const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const categoriaController = require("../controllers/categoria.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.get("/api/categoria", categoriaController.getCategoria);
router.post("/api/categoria", categoriaController.crearCategoria);
router.post("/api/categoria/editar", categoriaController.editarCategoria);



module.exports = router;