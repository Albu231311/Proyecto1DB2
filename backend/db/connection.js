const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);
let db;
let bucket;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(); 
    
    bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
    console.log("Conexión exitosa a MongoDB Atlas");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
}

const getDb = () => db;
const getBucket = () => bucket;

module.exports = { connectDB, getDb, getBucket };