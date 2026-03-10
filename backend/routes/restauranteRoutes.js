const express = require('express');
const router = express.Router();
const restCtrl = require('../controllers/restauranteController');


router.get('/buscar', restCtrl.buscarRestaurantes); 
router.get('/top', restCtrl.getMejoresRestaurantes);
router.get('/cercanos', restCtrl.getRestaurantesCercanos);
router.get('/reporte/mejor-calificados', restCtrl.getMejorCalificados); 


router.get('/', restCtrl.getRestaurantes);
router.post('/', restCtrl.createRestaurante);


router.get('/:id', restCtrl.getRestauranteById); 
router.put('/:id', restCtrl.updateRestaurante);
router.delete('/:id', restCtrl.deleteRestaurante);
router.put('/:id/direccion', restCtrl.addDireccionRestaurante);

module.exports = router;