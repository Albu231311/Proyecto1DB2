const express = require('express');
const router = express.Router();
const archivoCtrl = require('../controllers/archivoController');

// Ruta para subir (POST)
router.post('/upload', archivoCtrl.subirArchivoGridFS);

// Ruta para ver (GET)
router.get('/ver/:id', archivoCtrl.verImagen);

module.exports = router;