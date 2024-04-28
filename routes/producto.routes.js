const express = require("express");
// Importo el contorlador con todos los metodos / funciones
const productoController = require("../controllers/producto.controller.js");

const router = express.Router();

// Defino las rutas de acceso a cada metodo / funcion
router.get("/api/producto", productoController.getProductos);
// router.get("/api/getProductosDisp", productoController.getProductosDisponibles);
router.post("/api/producto", productoController.crearProducto);
// router.post("/api/producto/borrar", productoController.eliminarProducto);

router.post("/api/producto/disponibilidad", productoController.cambioDisponibilidad);
router.post("/api/producto/editar", productoController.editarProducto);
// router.patch("/api/producto/disponibilidad", productoController.actualizarDisponibilidad);



module.exports = router;