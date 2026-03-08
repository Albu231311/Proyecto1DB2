db.usuarios.createIndex(
  { email: 1 },
  { unique: true }
)

db.ordenes.createIndex(
  { restauranteId: 1, fecha_pedido: -1 }
)


db.ordenes.createIndex(
  { usuarioId: 1, fecha_pedido: -1 }
)


db.restaurantes.createIndex({
  "direcciones.ubicacion": "2dsphere"
})

db.restaurantes.createIndex({ categorias: 1 })

db.resenas.createIndex({ restauranteId: 1 })

db.ordenes.createIndex({ "items.articuloId": 1 })

db.restaurantes.createIndex({ nombre: "text", descripcion: "text" })