const express = require("express");
const cajaController = require("../controllers/caja.controller.js");

const router = express.Router();

router.get("/api/ventaDia", cajaController.ventaDia);
router.get("/api/ventaMes", cajaController.ventaMes);
router.get("/api/ventaAnual", cajaController.ventaAnual);

router.get("/api/pedidosDia", cajaController.pedidosDia);
router.get("/api/pedidosMes", cajaController.pedidosMes);
router.get("/api/pedidosAnio", cajaController.pedidosAnio);

router.get("/api/online", cajaController.sumarPedidosOnline);
router.get("/api/local", cajaController.sumarPedidosLocal);

router.get("/api/enviadosDomicilio", cajaController.sumarPedidosEnvioDomicilio);
router.get("/api/retiradosLocal", cajaController.sumarPedidosRetiroLocal);

module.exports = router;