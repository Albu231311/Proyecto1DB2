const express = require('express');
const router = express.Router();
const ordenCtrl = require('../controllers/ordenController');

// 1. Operaciones de Reportes 
router.get('/reporte/detallado', ordenCtrl.getOrdenesDetalladas); 
router.get('/reporte/totales', ordenCtrl.getTotalVentasPorRestaurante);

// 2. Operaciones CRUD Estándar
router.post('/', ordenCtrl.crearOrden);
router.get('/', ordenCtrl.getOrdenes);
router.get('/:id', ordenCtrl.getOrdenById);
router.put('/:id', ordenCtrl.updateOrden);
router.delete('/:id', ordenCtrl.deleteOrden);

//platillos más vendidos
router.get('/reporte/platillos-top', ordenCtrl.getPlatillosMasVendidos);

// Ruta para el reporte de clientes top
router.get('/reporte/clientes-recurrentes', ordenCtrl.getClientesRecurrentes);

module.exports = router;