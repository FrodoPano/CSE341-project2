const dotenv = require('dotenv');
dotenv.config();

const MongoClient = require('mongodb').MongoClient;

let database;

const initDb = (callback) => {
    if(database) {
        console.log('Db is already initialized!');
        return callback(null, database);
    }
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined in environment variables');
        return callback(new Error('MONGODB_URI is not defined'), null);
    }

    MongoClient.connect(process.env.MONGODB_URI)
        .then((client) => {
            database = client;
            console.log('Connected to MongoDB successfully');
            callback(null, database);
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB:', err);
            callback(err);
        });
};

const getDatabase = () => {
    if (!database) {
        throw Error('Database not initialized')
     }
     return database;
};

module.exports = {
    initDb,
    getDatabase
};