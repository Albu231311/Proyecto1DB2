const express = require('express');
const router = express.Router();
const menuCtrl = require('../controllers/menuController');

// 1. Creación
router.post('/', menuCtrl.addArticulos);

// 2. Lectura General y Masivos
router.get('/', menuCtrl.getArticulos);
router.put('/update-precios', menuCtrl.updatePreciosCategoria); 

// 3. Operaciones por ID (Singular)
router.get('/:id', menuCtrl.getArticuloById);
router.put('/:id', menuCtrl.updateArticulo);
router.delete('/:id', menuCtrl.deleteArticulo);


// PUT 
router.put('/update-precios', menuCtrl.updatePreciosPorCategoria);



module.exports = router;