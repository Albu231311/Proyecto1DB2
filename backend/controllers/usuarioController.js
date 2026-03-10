const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

exports.createUsuario = async (req, res) => {
    const db = getDb();
    try {
        const user = req.body;
        const nuevoUsuario = {
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            
            direccionesEnvio: user.direccionesEnvio.map(dir => ({
                alias: dir.alias,
                calle: dir.calle,
                zona: dir.zona,
                ciudad: dir.ciudad,
                ubicacion: {
                    type: "Point",
                    coordinates: [ parseFloat(dir.lng), parseFloat(dir.lat) ]
                }
            })),
            fecha_registro: new Date()
        };

        const result = await db.collection('usuarios').insertOne(nuevoUsuario);
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ error: "Error al crear usuario: " + e.message });
    }
};

 
exports.getUsuarios = async (req, res) => {
    const db = getDb();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        
        const [users, totalItems] = await Promise.all([
            db.collection('usuarios')
                .find()
                .project({ nombre: 1, email: 1, rol: 1, direccionesEnvio: 1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('usuarios').countDocuments() 
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        
        res.json({
            docs: users,
            totalPages: totalPages,
            totalItems: totalItems,
            currentPage: page
        });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};


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

//update usuario
exports.updateUsuario = async (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const user = req.body;

    try {
        const updateDoc = {
            $set: {
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                
                direccionesEnvio: user.direccionesEnvio.map(dir => ({
                    alias: dir.alias,
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

        const result = await db.collection('usuarios').updateOne(
            { _id: new ObjectId(id) },
            updateDoc
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario actualizado con éxito", result });
    } catch (e) {
        res.status(500).json({ error: "Error al actualizar usuario: " + e.message });
    }
};