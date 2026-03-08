const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

exports.createUsuario = async (req, res) => {
    const db = getDb();
    const result = await db.collection('usuarios').insertOne({ ...req.body, fecha_registro: new Date() });
    res.status(201).json(result);
};

// Leer TODOS 
exports.getUsuarios = async (req, res) => {
    const db = getDb();
    const { skip = 0, limit = 20 } = req.query;
    try {
        const users = await db.collection('usuarios')
            .find()
            .project({ nombre: 1, email: 1, rol: 1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .toArray();
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Leer UNO
exports.getUsuario = async (req, res) => {
    const db = getDb();
    try {
        const user = await db.collection('usuarios').findOne({ _id: new ObjectId(req.params.id) });
        if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.addDireccion = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('usuarios').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { direccionesEnvio: req.body } }
        );
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteUsuario = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('usuarios').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

//  Eliminar todos los usuarios que no han completado su perfil (rol 'invitado')
exports.deleteInvitados = async (req, res) => {
    const db = getDb();
    try {
        const result = await db.collection('usuarios').deleteMany({ rol: "invitado" });
        res.json({
            mensaje: "Eliminación masiva completada",
            cantidadEliminada: result.deletedCount
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};