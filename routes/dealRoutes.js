import express from 'express';
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { connectToMongoDB, closeMongoDBConnection } from '../src/db.js';

const router = express.Router();

// Define Joi schema for deal validation
const dealSchema = Joi.object({
  deal_id: Joi.string().required().description('randomly generated').example('random_deal_id'),
  car_id: Joi.string().required(),
  deal_info: Joi.object().description('store additional fields')
});

// Middleware function to validate deal data against the schema
const validateDealData = (req, res, next) => {
  const { error } = dealSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Routes

// Create a new deal
router.post('/deals', validateDealData, async (req, res) => {
  

     const dealdata = req.body
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('deals');
    const result = await collection.insertOne(dealdata);
    await closeMongoDBConnection();

    res.status(201).json({"success":true,
                           "message":"deal success"});
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all deals
router.get('/getalldeals', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('deals');
    const deals = await collection.find({}).toArray();
    await closeMongoDBConnection();

    res.status(200).json(deals);
  } catch (error) {
    console.error('Error getting deals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific deal by ID
router.get('/deals/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('deals');
    const deal = await collection.findOne({ _id: new ObjectId(req.params.id) });
    await closeMongoDBConnection();
    console.log(deal)
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.status(200).json(deal);
  } catch (error) {
    console.error('Error getting deal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a deal by ID
router.put('/deals/:id', validateDealData, async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('deals');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    await closeMongoDBConnection();

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.status(200).json({ message: 'Deal updated successfully' });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a deal by ID
router.delete('/deals/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collection = db.collection('deals');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    await closeMongoDBConnection();

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.status(200).json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
