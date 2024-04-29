const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const productoController = require("../controllers/producto.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.get("/api/producto", productoController.getProductos);
router.post("/api/producto", productoController.crearProducto);
router.post("/api/producto/borrar", productoController.eliminarProducto);
router.post("/api/producto/cambiarEstadoDisponible", productoController.cambioEstadoDisponible);
router.post("/api/producto/disponibilidad", productoController.cambioDisponibilidad);
router.post("/api/producto/editar", productoController.editarProducto);




module.exports = router;