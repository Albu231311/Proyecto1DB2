const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

//LECTURA Y CONSULTA
exports.getRestaurantes = async (req, res) => {
    const db = getDb();
    const { categoria, skip = 0, limit = 10 } = req.query;
    
    // Filtros 
    const query = categoria ? { categorias: categoria } : {};

    try {
        const results = await db.collection('restaurantes')
            .find(query)
            .project({ nombre: 1, promedioCalificacion: 1, categorias: 1, imagen: 1 }) // Proyecciones 
            .sort({ promedioCalificacion: -1 }) // Ordenamiento 
            .skip(parseInt(skip)) // Skip 
            .limit(parseInt(limit)) // Límite 
            .toArray();
        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Búsqueda Geoespacial
exports.getRestaurantesCercanos = async (req, res) => {
    const db = getDb();
    const { lng, lat } = req.query;
    try {
        const pipeline = [{
            $geoNear: {
                near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                distanceField: "distancia",
                maxDistance: 5000,
                spherical: true
            }
        }];
        const results = await db.collection('restaurantes').aggregate(pipeline).toArray();
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// AGREGACIONES COMPLEJAS 
exports.getMejoresRestaurantes = async (req, res) => {
    const db = getDb();
    const pipeline = [
        { $match: { totalResenas: { $gt: 0 } } },
        { $sort: { promedioCalificacion: -1 } },
        { $limit: 10 }
    ];
    const top = await db.collection('restaurantes').aggregate(pipeline).toArray();
    res.json(top);
};

// ACTUALIZACIÓN
exports.updateRestaurante = async (req, res) => {
    const db = getDb();
    const { id } = req.params;
    try {
        const result = await db.collection('restaurantes').updateOne( // Actualizar 1 
            { _id: new ObjectId(id) },
            { $set: req.body }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//ELIMINACIÓN
exports.deleteRestaurante = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('restaurantes').deleteOne({ // Eliminar 1 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//CREACIÓN
exports.createRestaurante = async (req, res) => {
    const db = getDb();
    try {
        
        const data = Array.isArray(req.body) ? req.body : [req.body];
        const result = await db.collection('restaurantes').insertMany(data);
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// --- ELIMINACIÓN MASIVA 
exports.deleteMuchosRestaurantes = async (req, res) => {
    const db = getDb();
    const { categoria } = req.body; // Ejemplo: borrar todos los de una categoría cerrada
    try {
        const result = await db.collection('restaurantes').deleteMany({
            categorias: categoria 
        });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};


exports.getRestauranteById = async (req, res) => {
    const db = getDb();
    try {
        const restaurante = await db.collection('restaurantes').findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!restaurante) {
            return res.status(404).json({ mensaje: "Restaurante no encontrado" });
        }
        
        res.json(restaurante);
    } catch (e) {
        res.status(500).json({ error: "ID no válido o error de servidor" });
    }
};


// Manejo de Arrays: Añadir una dirección extra ($push)
exports.addDireccionRestaurante = async (req, res) => {
    const db = getDb();
    const { id } = req.params;
    try {
        const result = await db.collection('restaurantes').updateOne(
            { _id: new ObjectId(id) },
            { 
                $push: { 
                    direcciones: {
                        ...req.body,
                        ubicacion: req.body.ubicacion || { type: "Point", coordinates: [0, 0] }
                    } 
                } 
            }
        );
        res.json({ msg: "Dirección añadida exitosamente", result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

//restaurantes mejores calificados
exports.getMejorCalificados = async (req, res) => {
    const db = getDb();
    const pipeline = [
        // 1. Unir con la colección de restaurantes para tener el nombre
        {
            $lookup: {
                from: "restaurantes",
                localField: "restauranteId",
                foreignField: "_id",
                as: "infoRest"
            }
        },
        // 2. Descomponer el array de la unión
        { $unwind: "$infoRest" },
        // 3. Agrupar por restaurante y calcular el promedio
        {
            $group: {
                _id: "$infoRest.nombre",
                promedioCalificacion: { $avg: "$calificacion" }, // Promedio (Agregación Compleja)
                totalResenas: { $sum: 1 } // Conteo (Agregación Simple)
            }
        },
        // 4. Ordenar: los más altos primero 
        { $sort: { promedioCalificacion: -1 } },
        // 5. Limitar a los mejores 5
        { $limit: 5 }
    ];

    try {
        const reporte = await db.collection('resenas').aggregate(pipeline).toArray();
        res.json(reporte);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};