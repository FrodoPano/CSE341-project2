
const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    //#swagger.tags=['Users']
    const result = await mongodb.getDatabase().db().collection('pokemon').find();
    result.toArray().then((users) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users);
    });
};

const getSingle = async (req, res) => {
    //#swagger.tags=['Users']
    const userId = new ObjectId(req.params.id);
    const result = await mongodb.getDatabase().db().collection('pokemon').find({ _id: userId });
    result.toArray().then((users) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(users[0]);
    });
};

const createUser = async(req, res) => {
    //#swagger.tags=['Users']
    const user = {
        name: req.body.name,
        type: req.body.type,
        number: req.body.number,
        worldNumber: req.body.worldNumber
    };
    const response = await mongodb.getDatabase().db().collection('pokemon').insertOne(user);
    if (response.acknowledged > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error ocurred while updating the user.');
    }
};


const updateUser = async(req, res) => {
    //#swagger.tags=['Users']
    const userId = new ObjectId(req.params.id);
    const user = {
        name: req.body.name,
        type: req.body.type,
        number: req.body.number,
        worldNumber: req.body.worldNumber
    };
    const response = await mongodb.getDatabase().db().collection('pokemon').replaceOne({_id: userId}, user);
    if (response.modifiedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error ocurred while updating the user.');
    }
};

const deleteUser = async(req, res) => {
    //#swagger.tags=['Users']
    const userId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('pokemon').deleteOne({_id: userId});
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error ocurred while deleting the user.');
    }
};



module.exports = {
    getAll,
    getSingle,
    createUser,
    updateUser,
    deleteUser
};