db.resenas.aggregate([
  {
    $group: {
      _id: "$restauranteId",
      promedio: { $avg: "$calificacion" },
      total: { $sum: 1 }
    }
  }
]).forEach(stat => {
  db.restaurantes.updateOne(
    { _id: stat._id },
    {
      $set: {
        promedioCalificacion: stat.promedio,
        totalResenas: stat.total
      }
    }
  );
});