
//restaurantes
db.restaurantes.drop()

const categoriasBase = [
  "Fast Food","Mexican","Italian","Chinese","Japanese",
  "Burgers","Pizza","Healthy","Vegetarian","Seafood",
  "BBQ","Cafe","Desserts","Bakery","International"
];

// Pool de imágenes reutilizables
const imagenesRestaurantes = Array.from({length: 10}, () => ObjectId());

let restaurantes = [];

for (let i = 0; i < 5000; i++) {

  const categoriasRandom = categoriasBase
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random()*3)+1);

  restaurantes.push({
    nombre: "Restaurante " + i,
    descripcion: "Descripcion del restaurante " + i,
    categorias: categoriasRandom,

    direcciones: [
      {
        calle: "Calle " + i,
        zona: String(Math.floor(Math.random() * 20) + 1),
        ciudad: "Guatemala",
        ubicacion: {
          type: "Point",
          coordinates: [
            -90.8 + (Math.random() * 1.5),
            14.3 + (Math.random() * 1.5)
          ]
        }
      }
    ],

    imagen: {
      fileId: imagenesRestaurantes[Math.floor(Math.random()*imagenesRestaurantes.length)],
      nombre: "restaurante.jpg",
      tipo: "image/jpeg",
      fecha_subida: new Date()
    },

    promedioCalificacion: 0,
    totalResenas: 0,

    fecha_registro: new Date()
  });
}

db.restaurantes.insertMany(restaurantes)

//usuarios
db.usuarios.drop()

let usuarios = [];

for (let i = 0; i < 20000; i++) {

  usuarios.push({
    nombre: "Usuario " + i,
    email: "usuario" + i + "@correo.com",
    rol: "cliente",

    direccionesEnvio: [
      {
        _id: ObjectId(),
        alias: "Casa",
        calle: "Avenida " + i,
        zona: String(Math.floor(Math.random() * 20) + 1),
        ciudad: "Guatemala",
        ubicacion: {
          type: "Point",
          coordinates: [
            -90.8 + (Math.random() * 1.5),
            14.3 + (Math.random() * 1.5)
          ]
        }
      }
    ],

    fecha_registro: new Date()
  });
}

db.usuarios.insertMany(usuarios)

//articulosmenu
db.articulosmenu.drop()

const restaurantesIds = db.restaurantes.find({}, {_id:1}).toArray().map(r => r._id);

const imagenesProductos = Array.from({length: 15}, () => ObjectId());

let articulos = [];

for (let i = 0; i < 50000; i++) {

  const restId = restaurantesIds[Math.floor(Math.random() * restaurantesIds.length)];

  articulos.push({
    restauranteId: restId,
    nombre: "Producto " + i,
    descripcion: "Descripcion producto " + i,
    categoria: "Categoria " + (i % 10),
    precio: Math.floor(Math.random() * 100) + 10,

    imagen: {
      fileId: imagenesProductos[Math.floor(Math.random()*imagenesProductos.length)],
      nombre: "producto.jpg",
      tipo: "image/jpeg"
    },

    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  });
}

db.articulosmenu.insertMany(articulos)

//ordenes
db.ordenes.drop()

const usuariosIds = db.usuarios.find({}, {_id:1}).toArray().map(u => u._id);
const articulosData = db.articulosmenu.find().limit(50000).toArray();

let ordenes = [];

for (let i = 0; i < 50000; i++) {

  const usuarioId = usuariosIds[Math.floor(Math.random() * usuariosIds.length)];
  const itemsCount = Math.floor(Math.random() * 4) + 1;

  let items = [];
  let total = 0;

  for (let j = 0; j < itemsCount; j++) {
    const articulo = articulosData[Math.floor(Math.random() * articulosData.length)];
    const cantidad = Math.floor(Math.random() * 3) + 1;
    const subtotal = articulo.precio * cantidad;

    total += subtotal;

    items.push({
      articuloId: articulo._id,
      nombre: articulo.nombre,
      precioUnitario: articulo.precio,
      cantidad: cantidad,
      subtotal: subtotal
    });
  }

  ordenes.push({
    usuarioId: usuarioId,
    restauranteId: items[0].articuloId ? articulosData.find(a=>a._id.equals(items[0].articuloId)).restauranteId : restaurantesIds[0],
    items: items,
    total: total,

    direccionEntrega: {
      calle: "Zona " + Math.floor(Math.random()*20),
      ciudad: "Guatemala",
      ubicacion: {
        type: "Point",
        coordinates: [
          -90.8 + (Math.random() * 1.5),
          14.3 + (Math.random() * 1.5)
        ]
      }
    },

    estado: ["pendiente","confirmado","preparando","en_camino","entregado"][Math.floor(Math.random()*5)],
    fecha_actualizacion: new Date()
  });
}

db.ordenes.insertMany(ordenes)

//resenas
db.resenas.drop()

const ordenesData = db.ordenes.find({estado:"entregado"}).limit(30000).toArray();

let resenas = [];

for (let i = 0; i < ordenesData.length; i++) {

  resenas.push({
    usuarioId: ordenesData[i].usuarioId,
    restauranteId: ordenesData[i].restauranteId,
    ordenId: ordenesData[i]._id,
    calificacion: Math.floor(Math.random() * 5) + 1,
    comentario: "Comentario " + i,
    fecha: new Date()
  });
}

db.resenas.insertMany(resenas)