const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

// 1. CREACIÓN
exports.createResena = async (req, res) => {
    const db = getDb();
    const { usuarioId, restauranteId, ordenId, calificacion, comentario } = req.body;
    try {
        const resena = {
            usuarioId: new ObjectId(usuarioId),
            restauranteId: new ObjectId(restauranteId),
            ordenId: ordenId ? new ObjectId(ordenId) : null, 
            calificacion: parseFloat(calificacion),
            comentario,
            fecha: new Date()
        };
        
        const result = await db.collection('resenas').insertOne(resena);
        
        // Actualizar estadísticas del restaurante de forma atómica
        await db.collection('restaurantes').updateOne(
            { _id: new ObjectId(restauranteId) },
            { 
                $inc: { totalResenas: 1 }, 
                
                $set: { promedioCalificacion: parseFloat(calificacion) } 
            }
        );
        
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: "Error al crear reseña: " + e.message }); }
};

// 2. LECTURA
exports.getResenas = async (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [results, totalItems] = await Promise.all([
            db.collection('resenas').aggregate([
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "usuarioId",
                        foreignField: "_id",
                        as: "usuarioInfo"
                    }
                },
                {
                    $lookup: {
                        from: "restaurantes",
                        localField: "restauranteId",
                        foreignField: "_id",
                        as: "restauranteInfo"
                    }
                },
                
                { $unwind: { path: "$usuarioInfo", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$restauranteInfo", preserveNullAndEmptyArrays: true } },
                { $sort: { fecha: -1 } }, // Mostrar las más recientes primero
                { $skip: skip },
                { $limit: limit }
            ]).toArray(),
            db.collection('resenas').countDocuments()
        ]);

        res.json({
            docs: results,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            currentPage: page
        });
    } catch (e) {
        res.status(500).json({ error: "Error en agregación de reseñas: " + e.message });
    }
};

// 3. LEER POR ID
exports.getResenaById = async (req, res) => {
    const db = getDb();
    try {
        const resena = await db.collection('resenas').findOne({ _id: new ObjectId(req.params.id) });
        if (!resena) return res.status(404).json({ error: "Reseña no encontrada" });
        res.json(resena);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 4. ACTUALIZACIÓN 
exports.updateResena = async (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const data = req.body;
    try {
        const updateDoc = {};
        
        
        if (data.calificacion) updateDoc.calificacion = parseFloat(data.calificacion);
        if (data.comentario) updateDoc.comentario = data.comentario;
        if (data.usuarioId) updateDoc.usuarioId = new ObjectId(data.usuarioId);
        if (data.restauranteId) updateDoc.restauranteId = new ObjectId(data.restauranteId);
        if (data.ordenId) updateDoc.ordenId = new ObjectId(data.ordenId);

        const result = await db.collection('resenas').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateDoc }
        );
        
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Error al actualizar reseña: " + e.message }); }
};

// 5. ELIMINACIÓN
exports.deleteResena = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('resenas').deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};