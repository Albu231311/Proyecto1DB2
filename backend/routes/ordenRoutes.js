const express = require('express');
const router = express.Router();
const ordenCtrl = require('../controllers/ordenController');

// 1. Reportes
router.get('/reporte/detallado', ordenCtrl.getOrdenesDetalladas); 
router.get('/reporte/totales', ordenCtrl.getTotalVentasPorRestaurante);
router.get('/reporte/platillos-top', ordenCtrl.getPlatillosMasVendidos);
router.get('/reporte/clientes-recurrentes', ordenCtrl.getClientesRecurrentes);

// 2. CRUD
router.post('/', ordenCtrl.crearOrden);
router.get('/', ordenCtrl.getOrdenes);
router.get('/:id', ordenCtrl.getOrdenById);
router.put('/:id', ordenCtrl.updateOrden);
router.delete('/:id', ordenCtrl.deleteOrden);

module.exports = router;