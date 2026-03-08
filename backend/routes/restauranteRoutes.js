const express = require('express');
const router = express.Router();
const restCtrl = require('../controllers/restauranteController'); // <--- Usamos restCtrl

// 1. Rutas fijas 
router.get('/top', restCtrl.getMejoresRestaurantes);
router.get('/cercanos', restCtrl.getRestaurantesCercanos);

router.get('/reporte/mejor-calificados', restCtrl.getMejorCalificados); 

// 2. Rutas generales
router.get('/', restCtrl.getRestaurantes);
router.post('/', restCtrl.createRestaurante);

// 3. Rutas con parámetros 
router.get('/:id', restCtrl.getRestauranteById); 
router.put('/:id', restCtrl.updateRestaurante);
router.delete('/:id', restCtrl.deleteRestaurante);
router.put('/:id/direccion', restCtrl.addDireccionRestaurante);

module.exports = router;