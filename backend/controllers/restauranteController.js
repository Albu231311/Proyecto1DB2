const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

// 1. BÚSQUEDA POR TEXTO
exports.buscarRestaurantes = async (req, res) => {
    const db = getDb();
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const resultados = await db.collection('restaurantes')
            .find({ $text: { $search: q } }) 
            .limit(10)
            .toArray();
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ error: "Error en el índice de Atlas: " + error.message });
    }
};

// 2. LECTURA Y CONSULTA CON PAGINACIÓN
exports.getRestaurantes = async (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [docs, totalItems] = await Promise.all([
            db.collection('restaurantes').find().skip(skip).limit(limit).toArray(),
            db.collection('restaurantes').countDocuments()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        res.json({ docs, totalPages, currentPage: page, totalItems });
    } catch (error) {
        res.status(500).json({ error: "Error al paginar datos" });
    }
};

// 3. BÚSQUEDA GEOESPACIAL
exports.getRestaurantesCercanos = async (req, res) => {
    const db = getDb();
    const { lng, lat } = req.query;

    if (!lng || !lat) {
        return res.status(400).json({ error: "Latitud y Longitud son requeridas" });
    }

    try {
        const pipeline = [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distancia",
                    maxDistance: 5000,
                    spherical: true,
                    key: "direcciones.ubicacion" 
                }
            },
            
            {
                $project: {
                    nombre: 1,
                    distancia: 1,
                    categorias: 1
                }
            },
            { $limit: 15 }
        ];

        const results = await db.collection('restaurantes').aggregate(pipeline).toArray();
        res.json(results);
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: e.message }); 
    }
};

// 4. AGREGACIONES: MEJORES POR RESEÑAS
exports.getMejoresRestaurantes = async (req, res) => {
    const db = getDb();
    const pipeline = [
        { $match: { totalResenas: { $gt: 0 } } },
        { $sort: { promedioCalificacion: -1 } },
        { $limit: 10 }
    ];
    try {
        const top = await db.collection('restaurantes').aggregate(pipeline).toArray();
        res.json(top);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 5. OBTENER POR ID (Corregida la sintaxis)
exports.getRestauranteById = async (req, res) => {
    const db = getDb();
    try {
        const restaurante = await db.collection('restaurantes').findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        if (!restaurante) return res.status(404).json({ mensaje: "No encontrado" });
        res.json(restaurante);
    } catch (e) { res.status(500).json({ error: "ID no válido" }); }
};

// 6. ACTUALIZACIÓN ($set)
exports.updateRestaurante = async (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const rest = req.body;

    try {
        const updateDoc = {
            $set: {
                nombre: rest.nombre,
                descripcion: rest.descripcion,
                categorias: Array.isArray(rest.categorias) ? rest.categorias : [rest.categorias],
               
                direcciones: rest.direcciones.map(dir => ({
                    calle: dir.calle,
                    zona: dir.zona,
                    ciudad: dir.ciudad,
                    ubicacion: {
                        type: "Point",
                        coordinates: [ parseFloat(dir.lng), parseFloat(dir.lat) ]
                    }
                }))
            }
        };

        const result = await db.collection('restaurantes').updateOne(
            { _id: new ObjectId(id) },
            updateDoc
        );
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Error al actualizar: " + e.message });
    }
};

// 7. ELIMINACIÓN
exports.deleteRestaurante = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('restaurantes').deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 8. CREACIÓN MASIVA
exports.createRestaurante = async (req, res) => {
    const db = getDb();
    try {
        const bodyData = Array.isArray(req.body) ? req.body : [req.body];
        
        const restaurantesAInsertar = bodyData.map(rest => ({
            nombre: rest.nombre,
            descripcion: rest.descripcion || "",
            categorias: rest.categorias,
            
            direcciones: rest.direcciones.map(dir => ({
                calle: dir.calle,
                zona: dir.zona,
                ciudad: dir.ciudad,
                ubicacion: {
                    type: "Point",
                    coordinates: [ parseFloat(dir.lng), parseFloat(dir.lat) ] 
                }
            })),
            promedioCalificacion: 0,
            totalResenas: 0,
            estado: "Active",
            fecha_registro: new Date()
        }));

        const result = await db.collection('restaurantes').insertMany(restaurantesAInsertar);
        res.status(201).json(result);
    } catch (e) { 
        res.status(500).json({ error: "Error de inserción GeoJSON: " + e.message }); 
    }
};

// 9. ELIMINACIÓN MASIVA
exports.deleteMuchosRestaurantes = async (req, res) => {
    const db = getDb();
    const { categoria } = req.body;
    try {
        const result = await db.collection('restaurantes').deleteMany({ categorias: categoria });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 10. MANEJO DE ARRAYS ($push direcciones)
exports.addDireccionRestaurante = async (req, res) => {
    const db = getDb();
    const { id } = req.params;
    try {
        const result = await db.collection('restaurantes').updateOne(
            { _id: new ObjectId(id) },
            { $push: { direcciones: { ...req.body, ubicacion: req.body.ubicacion || { type: "Point", coordinates: [0, 0] } } } }
        );
        res.json({ msg: "Dirección añadida", result });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 11. REPORTE MEJOR CALIFICADOS (Agregación compleja con $lookup)
exports.getMejorCalificados = async (req, res) => {
    const db = getDb();
    const pipeline = [
        { $lookup: { from: "restaurantes", localField: "restauranteId", foreignField: "_id", as: "infoRest" } },
        { $unwind: "$infoRest" },
        { $group: { _id: "$infoRest.nombre", promedioCalificacion: { $avg: "$calificacion" }, totalResenas: { $sum: 1 } } },
        { $sort: { promedioCalificacion: -1 } },
        { $limit: 5 }
    ];
    try {
        const reporte = await db.collection('resenas').aggregate(pipeline).toArray();
        res.json(reporte);
    } catch (e) { res.status(500).json({ error: e.message }); }
};