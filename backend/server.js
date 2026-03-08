require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/connection');

// Importación de Rutas 
const restauranteRoutes = require('./routes/restauranteRoutes');
const ordenRoutes = require('./routes/ordenRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const menuRoutes = require('./routes/menuRoutes');
const resenaRoutes = require('./routes/resenaRoutes');
const imageRoutes = require('./routes/imageRoutes');
const archivoRoutes = require('./routes/archivoRoutes');

const app = express();

// Configuración del puerto desde el .env 
const PORT = process.env.PORT || 5000; 

// --- Middlewares ---

app.use(cors()); 
app.use(express.json()); 



// Gestión de Restaurantes: Lectura, Filtros, Proyecciones y GeoNear 
app.use('/api/restaurantes', restauranteRoutes);

// Gestión de Órdenes
app.use('/api/ordenes', ordenRoutes);

// Gestión de Usuarios
app.use('/api/usuarios', usuarioRoutes);

// Gestión de Menú
app.use('/api/menu', menuRoutes);

// Gestión de Reseñas
app.use('/api/resenas', resenaRoutes);

// Manejo de Archivos
app.use('/api/imagenes', imageRoutes);

app.use('/api/archivos', archivoRoutes);



connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`===========================================`);
            console.log(`Servidor de Proyecto MongoDB Activo`);
            console.log(`Puerto: ${PORT}`);
            console.log(`Base de Datos: restaurantDB`);
            console.log(`===========================================`);
        });
    })
    .catch(err => {
        console.error(" Error crítico: No se pudo conectar a MongoDB Atlas", err);
        process.exit(1);
    });