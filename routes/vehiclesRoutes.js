import express from 'express';
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { connectToMongoDB, closeMongoDBConnection } from '../src/db.js';

const router = express.Router();

// Define Joi schema for sold vehicle validation
const soldVehicleSchema = Joi.object({
  vehicle_id: Joi.string().required().description('randomly generated').example('random_vehicle_id'),
  car_id: Joi.string().required(),
  vehicle_info: Joi.object().description('store additional fields')
});

// Middleware function to validate sold vehicle data against the schema
const validateSoldVehicleData = (req, res, next) => {
  const { error } = soldVehicleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Routes

// Create a new sold vehicle
router.post('/sold_vehicles', validateSoldVehicleData, async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('sold_vehicles');
    const result = await collection.insertOne(req.body);
    await closeMongoDBConnection();

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating sold vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all sold vehicles
router.get('/sold_vehicles', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('sold_vehicles');
    const soldVehicles = await collection.find({}).toArray();
    await closeMongoDBConnection();

    res.status(200).json(soldVehicles);
  } catch (error) {
    console.error('Error getting sold vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific sold vehicle by ID
router.get('/sold_vehicles/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('sold_vehicles');
    const soldVehicle = await collection.findOne({ _id: new ObjectId(req.params.id) });
    await closeMongoDBConnection();

    if (!soldVehicle) {
      return res.status(404).json({ message: 'Sold vehicle not found' });
    }

    res.status(200).json(soldVehicle);
  } catch (error) {
    console.error('Error getting sold vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a sold vehicle by ID
router.put('/sold_vehicles/:id', validateSoldVehicleData, async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('sold_vehicles');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    await closeMongoDBConnection();

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Sold vehicle not found' });
    }

    res.status(200).json({ message: 'Sold vehicle updated successfully' });
  } catch (error) {
    console.error('Error updating sold vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a sold vehicle by ID
router.delete('/sold_vehicles/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('sold_vehicles');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    await closeMongoDBConnection();

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Sold vehicle not found' });
    }

    res.status(200).json({ message: 'Sold vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting sold vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
