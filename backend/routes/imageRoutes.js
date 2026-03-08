const express = require('express');
const router = express.Router();
const { getBucket } = require('../db/connection');
const { ObjectId } = require('mongodb');

// Endpoint para servir imágenes directamente al frontend de React
router.get('/:fileId', (req, res) => {
    try {
        const bucket = getBucket();
        const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.fileId));

        // Stream de los chunks hacia la respuesta HTTP 
        downloadStream.on('data', (chunk) => res.write(chunk));
        downloadStream.on('error', () => res.status(404).json({ msg: "Imagen no encontrada" }));
        downloadStream.on('end', () => res.end());
    } catch (error) {
        res.status(400).send("ID de archivo inválido");
    }
});

module.exports = router;