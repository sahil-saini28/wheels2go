import express from 'express';


// Import controllers
import Joi from 'joi'
import { connectToMongoDB, closeMongoDBConnection }from '../src/db.js'
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
// import {verifyToken } from '../src//middleware/VerifyUser.js'

const router = express.Router();


// import DealershipController from '../controllers/DealershipController.js';

// Define routes

const dealershipSchema = Joi.object({
  dealership_email: Joi.string().email().required(),
  dealership_id: Joi.string().required(),
  dealership_name: Joi.string().required(),
  dealership_location: Joi.string().required(),
  password: Joi.string().required(),
  dealership_info: Joi.object(),
  cars: Joi.array().items(Joi.string()),
  deals: Joi.array().items(Joi.string()),
  sold_vehicles: Joi.array().items(Joi.string())
});

const validateDealership = (req, res, next) => {
  const { error } = dealershipSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}



router.post('/singup',validateDealership, async (req, res) => {
  let db;
  try {
    const userData = req.body; 
    const {dealership_email, password} = req.body
    db = await connectToMongoDB();
    const collection = db.collection('dealership');
    const validateUser = await collection.findOne({dealership_email})
    // console.log(validateUser)
    if (validateUser){  return res.status(400).send('user is already exist');}
    const hashedPassword = bcryptjs.hashSync(userData.password, 10)
    userData.password= hashedPassword
    await collection.insertOne(userData);
    await closeMongoDBConnection();
    res.status(201).send(userData);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    res.status(400).json({ message: 'Invalid JSON data' });
  }
});

router.post('/singin', async (req, res) => {
  try {
     
    const {dealership_email, password} = req.body
    const db = await connectToMongoDB();
    const collection = db.collection('dealership');
    const validateUser = await collection.findOne({dealership_email})
    if (!validateUser){  return res.status(400).json({"Message":"Wrong credential "})}
    const validatePassword = bcryptjs.compareSync(password, validateUser.password)
    // console.log(validatePassword)
    if(!validatePassword){return res.status(400).json({"message":"Wrong credentila!"})}
    const token = jwt.sign({id:validateUser._id}, process.env.JWT_SECRET)
    // const { password: pass, ...rest } = validateUser._doc;

    await closeMongoDBConnection();
    res.cookie('access_token', token,)
    .status(200)
    .json({"success":true,
           "auth_token":token});
  } catch (error) {
    console.error('Error parsing JSON:', error);
    res.status(400).json({ message: 'Invalid JSON data' });
  }
});
router.post('/delete', async (req, res) => {
  try {
    const { did } = req.body;
    
    // Convert dealership ID to MongoDB ObjectId
    const objectId = new ObjectId(did);
    
    // Connect to MongoDB
    const db = await connectToMongoDB();
    const collection = db.collection('dealership');
    console.log(did)
    // Perform delete operation by _id
    const deletedCount = await collection.deleteOne({ _id: objectId });
    
    // Check if the delete operation was successful
    if (deletedCount.deletedCount === 1) {
      await closeMongoDBConnection();
      return res.status(200).json({ message: 'User deleted successfully', did });
    } else {
      await closeMongoDBConnection();
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/getalldealership', async (req, res) => {
  // console.log(res.cookie.token)
  
  try {
    // Connect to the MongoDB database
   const db = await connectToMongoDB();

    // Access the 'users' collection
    const collection = db.collection('dealership');

    // Fetch all users from the collection
    const users = await collection.find({}).toArray();

    // Close the database connection
    await closeMongoDBConnection();
    console.log(req.cookies)
    // Send the users as JSON response
    res.status(200).json(users);
  } catch (error) {
    // Log and send error response if any error occurs
    console.error('Error getting all users:', error);
    if (db) {
      await closeMongoDBConnection();
    }
    res.status(500).json({ message: 'Internal server error' });
  }
})



// router.post('/deals', DealershipController.addDeal);
// router.get('/soldVehicles', DealershipController.getSoldVehicles);

export default router;
