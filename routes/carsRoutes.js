

import express from 'express';
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { connectToMongoDB, closeMongoDBConnection } from '../src/db.js';

const router = express.Router();

// Define Joi schema for car validation
const carSchema = Joi.object({
  dealership_user_id: Joi.string().required().description('randomly generated').example('random_car_id'),
  type: Joi.string().required(),
  name: Joi.string().required(),
  model: Joi.string().required(),
  car_info: Joi.object().description('store additional fields'),
});

// Middleware function to validate car data against the schema
const validateCarData = (req, res, next) => {
  const { error } = carSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Routes

// Create a new car
router.post('/addcars', validateCarData, async (req, res) => {
  try {
    const userData = req.body;
    const db = await connectToMongoDB();
    const collection = db.collection('cars');
    // const result = await collection.insertOne(userData);
    const result=   await collection.insertOne(userData);
    if(result.ObjectId){return res.status(400).json({"message":"car not added"})}
    await closeMongoDBConnection();
  console.log(result)
    res.status(201).json(userData);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all cars
router.get('/getallcars', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('cars');
    const cars = await collection.find({}).toArray();
    await closeMongoDBConnection();

    res.status(200).json(cars);
  } catch (error) {
    console.error('Error getting cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific car by ID
router.get('/getcarsbyid/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('cars');
    const car = await collection.findOne({ _id: new ObjectId(req.params.id) });
    await closeMongoDBConnection();

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(car);
  } catch (error) {
    console.error('Error getting car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a car by ID
router.put('/cars/:id', validateCarData, async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('cars');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    await closeMongoDBConnection();

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a car by ID
router.delete('/cars/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('cars');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    await closeMongoDBConnection();

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// router.get('/cars/:dealershipId', CommonController.getCarsByDealership);
// router.post('/addVehicle', CommonController.addVehicle);

export default router;
