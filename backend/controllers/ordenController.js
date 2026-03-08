const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

//creación
exports.crearOrden = async (req, res) => {
    const db = getDb();
    try {
        const nuevaOrden = {
            ...req.body,
            usuarioId: new ObjectId(req.body.usuarioId), // Referencia
            restauranteId: new ObjectId(req.body.restauranteId), // Referencia
            fecha_pedido: new Date(),
            
        };
        const result = await db.collection('ordenes').insertOne(nuevaOrden);
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// LECTURA
exports.getOrdenes = async (req, res) => {
    const db = getDb();
    const { skip = 0, limit = 10 } = req.query;
    try {
        const results = await db.collection('ordenes')
            .find()
            .skip(parseInt(skip)) // Paginación
            .limit(parseInt(limit))
            .sort({ fecha_pedido: -1 })
            .toArray();
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getOrdenById = async (req, res) => {
    const db = getDb();
    try {
        const orden = await db.collection('ordenes').findOne({ _id: new ObjectId(req.params.id) });
        res.json(orden);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//ACTUALIZACIÓN
exports.updateOrden = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('ordenes').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//eliminación
exports.deleteOrden = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('ordenes').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};



//EXTRA
exports.getOrdenesDetalladas = async (req, res) => {
    const db = getDb();
    const { skip = 0, limit = 10 } = req.query;

    const pipeline = [
        // 1. Lookup para traer datos del Usuario
        {
            $lookup: {
                from: "usuarios",
                localField: "usuarioId",
                foreignField: "_id",
                as: "detalleUsuario"
            }
        },
        // 2. Lookup para traer datos del Restaurante
        {
            $lookup: {
                from: "restaurantes",
                localField: "restauranteId",
                foreignField: "_id",
                as: "detalleRestaurante"
            }
        },
        // 3. Proyección
        {
            $project: {
                _id: 1,
                total: 1,
                estado: 1,
                fecha_pedido: 1,
                "detalleUsuario.nombre": 1,
                "detalleUsuario.email": 1,
                "detalleRestaurante.nombre": 1
            }
        },
        // 4. Ordenamiento, Skip y Límite
        { $sort: { fecha_pedido: -1 } },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) }
    ];

    try {
        const results = await db.collection('ordenes').aggregate(pipeline).toArray();
        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


//Reporte de Ventas por Restaurante
exports.getTotalVentasPorRestaurante = async (req, res) => {
    const db = getDb();
    const pipeline = [
        // 1. Filtrar solo entregados para finanzas reales
        { $match: { estado: "entregado" } },
        
        // 2. TraeR el nombre del restaurante desde su colección
        {
            $lookup: {
                from: "restaurantes",
                localField: "restauranteId",
                foreignField: "_id",
                as: "infoRest"
            }
        },
        
        // 3. AgrupaR usando el nombre que acabamos de traer
        {
            $group: {
                _id: { $arrayElemAt: ["$infoRest.nombre", 0] }, // Esto quita el 'null'
                totalDineroGenerado: { $sum: "$total" },
                cantidadDePedidos: { $sum: 1 }
            }
        },
        
        // 4. OrdenaR por los que más dinero han generado
        { $sort: { totalDineroGenerado: -1 } }
    ];

    try {
        const reporte = await db.collection('ordenes').aggregate(pipeline).toArray();
        res.json(reporte);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

//platillos más vendidos
// Agregación Compleja: Top Platillos 
exports.getPlatillosMasVendidos = async (req, res) => {
    const db = getDb();
    const pipeline = [
        { $match: { estado: "entregado" } }, // Solo órdenes reales
        { $unwind: "$items" }, // Descomponer array de documentos embebidos
        {
            $group: {
                _id: "$items.nombre", // Agrupar por nombre del producto
                totalVendido: { $sum: "$items.cantidad" } // Sumar las cantidades vendidas
            }
        },
        { $sort: { totalVendido: -1 } }, // Ordenar: más vendidos primero
        { $limit: 10 }
    ];

    try {
        const reporte = await db.collection('ordenes').aggregate(pipeline).toArray();
        res.json(reporte);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

//usuarios más recurrentes
// Agregación Compleja: Clientes más recurrentes 
exports.getClientesRecurrentes = async (req, res) => {
    const db = getDb();
    const pipeline = [
        // 1. Filtrar solo órdenes con IDs válidos para evitar errores
        { $match: { usuarioId: { $type: "objectId" } } },
        
        // 2. Agrupar por usuario y contar pedidos
        {
            $group: {
                _id: "$usuarioId",
                totalPedidos: { $sum: 1 }, // Conteo simple
                montoTotalGastado: { $sum: "$total" } // Sumatoria compleja
            }
        },
        
        // 3. Unir con la colección de usuarios para obtener el nombre
        {
            $lookup: {
                from: "usuarios",
                localField: "_id",
                foreignField: "_id",
                as: "infoUsuario"
            }
        },
        
        // 4. Limpiar la salida (Proyección)
        {
            $project: {
                _id: 0,
                nombreCliente: { $arrayElemAt: ["$infoUsuario.nombre", 0] },
                totalPedidos: 1,
                montoTotalGastado: 1
            }
        },
        
        // 5. Ordenar: los que más compran primero
        { $sort: { totalPedidos: -1 } },
        { $limit: 10 }
    ];

    try {
        const reporte = await db.collection('ordenes').aggregate(pipeline).toArray();
        res.json(reporte);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};