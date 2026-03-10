const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

// 1. LECTURA CON JOIN (Optimizado para Gestion.jsx)
exports.getArticulos = async (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [results, totalItems] = await Promise.all([
            db.collection('articulosmenu').aggregate([
                {
                    $lookup: {
                        from: "restaurantes",
                        localField: "restauranteId",
                        foreignField: "_id",
                        as: "restauranteInfo"
                    }
                },
                // preserveNullAndEmptyArrays evita que el producto desaparezca si el restaurante no existe
                { $unwind: { path: "$restauranteInfo", preserveNullAndEmptyArrays: true } },
                { $skip: skip },
                { $limit: limit }
            ]).toArray(),
            db.collection('articulosmenu').countDocuments()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            docs: results,
            totalPages: totalPages,
            totalItems: totalItems,
            currentPage: page
        });
    } catch (e) { 
        res.status(500).json({ error: "Error en el Join de datos: " + e.message }); 
    }
};

// 2. CREACIÓN (Con validación de existencia de Restaurante)
exports.addArticulos = async (req, res) => {
    const db = getDb();
    try {
        const data = req.body;
        
        
        const restaurante = await db.collection('restaurantes').findOne({ _id: new ObjectId(data.restauranteId) });
        if (!restaurante) return res.status(404).json({ error: "El ID del restaurante no existe en Atlas." });

        const nuevoArticulo = {
            nombre: data.nombre,
            descripcion: data.descripcion || "",
            categoria: data.categoria,
            precio: parseFloat(data.precio),
            restauranteId: new ObjectId(data.restauranteId),
            fecha_creacion: new Date()
        };

        const result = await db.collection('articulosmenu').insertOne(nuevoArticulo);
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. LEER POR ID
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

// 4. ACTUALIZAR POR ID
exports.updateArticulo = async (req, res) => {
    const db = getDb();
    try {
        const data = req.body;
        const updateData = {};

        
        if (data.nombre) updateData.nombre = data.nombre;
        if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
        if (data.categoria) updateData.categoria = data.categoria;
        if (data.precio) updateData.precio = parseFloat(data.precio);
        
        
        if (data.restauranteId) {
            const restaurante = await db.collection('restaurantes').findOne({ _id: new ObjectId(data.restauranteId) });
            if (!restaurante) return res.status(404).json({ error: "El nuevo ID del restaurante no es válido." });
            updateData.restauranteId = new ObjectId(data.restauranteId);
        }

        const result = await db.collection('articulosmenu').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 5. ACTUALIZAR VARIOS POR CATEGORÍA
exports.updatePreciosCategoria = async (req, res) => {
    const db = getDb();
    const { categoria, incremento } = req.body;
    try {
        const result = await db.collection('articulosmenu').updateMany(
            { categoria: categoria },
            { $inc: { precio: parseFloat(incremento) } }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 6. ELIMINACIÓN
exports.deleteArticulo = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('articulosmenu').deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 7. ACTUALIZACIÓN MASIVA CON MENSAJE DETALLADO
exports.updatePreciosPorCategoria = async (req, res) => {
    const db = getDb();
    const { categoria, incremento } = req.body;
    try {
        const result = await db.collection('articulosmenu').updateMany(
            { categoria: categoria }, 
            { $inc: { precio: parseFloat(incremento) } } 
        );
        res.json({
            mensaje: `Se actualizaron ${result.modifiedCount} productos de la categoría ${categoria}`,
            detalles: result
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};