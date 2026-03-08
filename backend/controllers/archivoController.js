const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const { getBucket } = require('../db/connection');

// Subir imagenes
exports.subirArchivoGridFS = async (req, res) => {
    const bucket = getBucket();
    const filePath = path.join(__dirname, '../test.jpg'); 

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const uploadStream = bucket.openUploadStream('foto_platillo_final.jpg');
    fs.createReadStream(filePath).pipe(uploadStream);

    uploadStream.on('finish', () => {
        res.status(201).json({ 
            mensaje: "¡Éxito total! Archivo en GridFS", 
            fileId: uploadStream.id 
        });
    });
};

// Ver la imagen
exports.verImagen = (req, res) => {
    const bucket = getBucket();
    try {
        const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
        res.set('Content-Type', 'image/jpeg');
        downloadStream.pipe(res);

        downloadStream.on('error', () => {
            res.status(404).json({ error: "Imagen no encontrada" });
        });
    } catch (e) {
        res.status(400).json({ error: "ID inválido" });
    }
};