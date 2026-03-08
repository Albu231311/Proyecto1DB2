const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

// CREACIÓN
exports.addArticulos = async (req, res) => {
    const db = getDb();
    const articulos = Array.isArray(req.body) ? req.body : [req.body];
    const docs = articulos.map(art => ({
        ...art,
        restauranteId: new ObjectId(art.restauranteId),
        fecha_creacion: new Date()
    }));
    try {
        const result = await db.collection('articulosmenu').insertMany(docs);
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//LECTURA
exports.getArticulos = async (req, res) => {
    const db = getDb();
    const { skip = 0, limit = 20 } = req.query;
    try {
        const results = await db.collection('articulosmenu')
            .find()
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .toArray();
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Leer UNO en específico por ID
exports.getArticuloById = async (req, res) => {
    const db = getDb();
    try {
        const articulo = await db.collection('articulosmenu').findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        if (!articulo) return res.status(404).json({ msg: "Artículo no encontrado" });
        res.json(articulo);
    } catch (e) { res.status(500).json({ error: e.message }); }
};


// Actualizar UNO en específico
exports.updateArticulo = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('articulosmenu').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Actualizar VARIOS
exports.updatePreciosCategoria = async (req, res) => {
    const db = getDb();
    const { categoria, incremento } = req.body;
    try {
        const result = await db.collection('articulosmenu').updateMany(
            { categoria: categoria },
            { $inc: { precio: incremento } }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ELIMINACIÓN
exports.deleteArticulo = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('articulosmenu').deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};


// Actualización Masiva
exports.updatePreciosPorCategoria = async (req, res) => {
    const db = getDb();
    const { categoria, incremento } = req.body;
    try {
        const result = await db.collection('articulosmenu').updateMany(
            { categoria: categoria }, 
            { $inc: { precio: incremento } } 
        );
        res.json({
            mensaje: `Se actualizaron ${result.modifiedCount} productos de la categoría ${categoria}`,
            detalles: result
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};