const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

// 1. CREACIÓN
exports.crearOrden = async (req, res) => {
    const db = getDb();
    try {
        const nuevaOrden = {
            ...req.body,
            usuarioId: new ObjectId(req.body.usuarioId),
            restauranteId: new ObjectId(req.body.restauranteId),
            fecha_pedido: new Date(),
        };
        const result = await db.collection('ordenes').insertOne(nuevaOrden);
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 2. LECTURA GENERAL CON PAGINACIÓN (Corregida para Gestion.jsx)
exports.getOrdenes = async (req, res) => {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [results, totalItems] = await Promise.all([
            db.collection('ordenes').aggregate([
                { $sort: { fecha_pedido: -1 } },
                { $lookup: { from: "usuarios", localField: "usuarioId", foreignField: "_id", as: "usuarioInfo" } },
                { $lookup: { from: "restaurantes", localField: "restauranteId", foreignField: "_id", as: "restauranteInfo" } },
                { $unwind: "$usuarioInfo" },
                { $unwind: "$restauranteInfo" },
                { $skip: skip },
                { $limit: limit }
            ]).toArray(),
            db.collection('ordenes').countDocuments()
        ]);

        res.json({
            docs: results,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            currentPage: page
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. LEER POR ID
exports.getOrdenById = async (req, res) => {
    const db = getDb();
    try {
        const orden = await db.collection('ordenes').findOne({ _id: new ObjectId(req.params.id) });
        res.json(orden);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 4. ACTUALIZACIÓN
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

// 5. ELIMINACIÓN
exports.deleteOrden = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('ordenes').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- REPORTES ---
exports.getOrdenesDetalladas = async (req, res) => {
    const db = getDb();
    try {
        const results = await db.collection('ordenes').aggregate([
            { $lookup: { from: "usuarios", localField: "usuarioId", foreignField: "_id", as: "u" } },
            { $lookup: { from: "restaurantes", localField: "restauranteId", foreignField: "_id", as: "r" } },
            { $project: { total: 1, estado: 1, fecha_pedido: 1, cliente: { $arrayElemAt: ["$u.nombre", 0] }, restaurante: { $arrayElemAt: ["$r.nombre", 0] } } }
        ]).toArray();
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getTotalVentasPorRestaurante = async (req, res) => {
    const db = getDb();
    try {
        const reporte = await db.collection('ordenes').aggregate([
            { $match: { estado: "entregado" } },
            { $lookup: { from: "restaurantes", localField: "restauranteId", foreignField: "_id", as: "infoRest" } },
            { $group: { _id: { $arrayElemAt: ["$infoRest.nombre", 0] }, totalDineroGenerado: { $sum: "$total" }, cantidadDePedidos: { $sum: 1 } } },
            { $sort: { totalDineroGenerado: -1 } }
        ]).toArray();
        res.json(reporte);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getPlatillosMasVendidos = async (req, res) => {
    const db = getDb();
    try {
        const reporte = await db.collection('ordenes').aggregate([
            { $match: { estado: "entregado" } },
            { $unwind: "$items" },
            { $group: { _id: "$items.nombre", totalVendido: { $sum: "$items.cantidad" } } },
            { $sort: { totalVendido: -1 } },
            { $limit: 10 }
        ]).toArray();
        res.json(reporte);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getClientesRecurrentes = async (req, res) => {
    const db = getDb();
    try {
        const reporte = await db.collection('ordenes').aggregate([
            { $group: { _id: "$usuarioId", totalPedidos: { $sum: 1 }, monto: { $sum: "$total" } } },
            { $lookup: { from: "usuarios", localField: "_id", foreignField: "_id", as: "u" } },
            { $project: { nombreCliente: { $arrayElemAt: ["$u.nombre", 0] }, totalPedidos: 1, montoTotalGastado: 1 } },
            { $sort: { totalPedidos: -1 } },
            { $limit: 10 }
        ]).toArray();
        res.json(reporte);
    } catch (e) { res.status(500).json({ error: e.message }); }
};