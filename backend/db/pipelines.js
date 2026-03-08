//restaurantes mejores calificados
db.restaurantes.aggregate([
  {
    $match: { totalResenas: { $gt: 0 } }
  },
  {
    $sort: { promedioCalificacion: -1 }
  },
  {
    $limit: 10
  },
  {
    $project: {
      nombre: 1,
      promedioCalificacion: 1,
      totalResenas: 1
    }
  }
])

//indice recomendado
db.restaurantes.createIndex({ promedioCalificacion: -1 })

//ventas mensuales por restaurante
db.ordenes.aggregate([
  {
    $group: {
      _id: {
        restauranteId: "$restauranteId",
        año: { $year: "$fecha_pedido" },
        mes: { $month: "$fecha_pedido" }
      },
      totalVentas: { $sum: "$total" }
    }
  },
  {
    $sort: {
      "_id.restauranteId": 1,
      "_id.año": 1,
      "_id.mes": 1
    }
  }
])


//clientes más recurrentes
db.ordenes.aggregate([
  {
    $group: {
      _id: "$usuarioId",
      totalPedidos: { $sum: 1 },
      totalGastado: { $sum: "$total" }
    }
  },
  { $sort: { totalPedidos: -1 } },
  { $limit: 10 }
])

//indice recomendado
db.ordenes.createIndex({ usuarioId: 1 })

//busqueda de restaurantes cercanos
db.restaurantes.aggregate([
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [-90.5, 14.6]
      },
      distanceField: "distancia",
      maxDistance: 5000,
      spherical: true
    }
  },
  {
    $project: {
      nombre: 1,
      distancia: 1,
      promedioCalificacion: 1
    }
  }
])

//indice obligatorio
db.restaurantes.createIndex({
  "direcciones.ubicacion": "2dsphere"
})


//platillos más vendidos
db.ordenes.aggregate([

  // 1️⃣ Separar cada item
  { $unwind: "$items" },

  // 2️⃣ Agrupar por articuloId
  {
    $group: {
      _id: "$items.articuloId",
      nombrePlatillo: { $first: "$items.nombre" },
      restauranteId: { $first: "$restauranteId" },
      totalVendido: { $sum: "$items.cantidad" }
    }
  },

  // 3️⃣ Lookup para traer el restaurante
  {
    $lookup: {
      from: "restaurantes",
      localField: "restauranteId",
      foreignField: "_id",
      as: "restaurante"
    }
  },

  // 4️⃣ Convertir array restaurante en objeto
  { $unwind: "$restaurante" },

  // 5️⃣ Ordenar por ventas
  { $sort: { totalVendido: -1 } },

  // 6️⃣ Limitar resultados
  { $limit: 10 },

  // 7️⃣ Proyectar campos finales
  {
    $project: {
      _id: 0,
      nombrePlatillo: 1,
      nombreRestaurante: "$restaurante.nombre",
      totalVendido: 1
    }
  }

])

//indice
db.ordenes.createIndex({ "items.articuloId": 1 })
db.restaurantes.createIndex({ _id: 1 })