const mongo = require('mongodb');

const MongoClient = mongo.MongoClient;

const MONGO_URL = "mongodb://akankshama97_db_user:Maurya9721@ac-n8xfrtj-shard-00-00.vbeekgg.mongodb.net:27017,ac-n8xfrtj-shard-00-01.vbeekgg.mongodb.net:27017,ac-n8xfrtj-shard-00-02.vbeekgg.mongodb.net:27017/?ssl=true&replicaSet=atlas-t9f0ym-shard-0&authSource=admin&appName=Cluster0";
let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(MONGO_URL)
  .then(client => {
    callback();
    _db = client.db('airbnb');
  }).catch(err => {
    console.log('Error while connecting to Mongo: ', err);
  });
}

const getDB = () => {
  if (!_db) {
    throw new Error('Mongo not connected');
  }
  return _db;
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;