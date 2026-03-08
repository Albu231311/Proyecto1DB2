const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

// creación
exports.createResena = async (req, res) => {
    const db = getDb();
    const { usuarioId, restauranteId, ordenId, calificacion, comentario } = req.body;
    try {
        const resena = {
            usuarioId: new ObjectId(usuarioId),
            restauranteId: new ObjectId(restauranteId),
            ordenId: new ObjectId(ordenId),
            calificacion: parseFloat(calificacion),
            comentario,
            fecha: new Date()
        };
        const result = await db.collection('resenas').insertOne(resena);
        
        
        await db.collection('restaurantes').updateOne(
            { _id: new ObjectId(restauranteId) },
            { $inc: { totalResenas: 1 }, $set: { promedioCalificacion: calificacion } }
        );
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// LECTURA
exports.getResenas = async (req, res) => {
    const db = getDb();
    const { skip = 0, limit = 10 } = req.query;
    try {
        const results = await db.collection('resenas')
            .find()
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .sort({ fecha: -1 })
            .toArray();
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getResenaById = async (req, res) => {
    const db = getDb();
    try {
        const resena = await db.collection('resenas').findOne({ _id: new ObjectId(req.params.id) });
        res.json(resena);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ACTUALIZACIÓN
exports.updateResena = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('resenas').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//  ELIMINACIÓN
exports.deleteResena = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('resenas').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};