const express = require("express");
const cajaController = require("../controllers/caja.controller.js");

const router = express.Router();

router.get("/api/ventaDia", cajaController.ventaDia);
router.get("/api/ventaMes", cajaController.ventaMes);
router.get("/api/ventaAnual", cajaController.ventaAnual);


module.exports = router;