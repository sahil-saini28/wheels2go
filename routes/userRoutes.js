import express from 'express';
const router = express.Router();
import Joi from 'joi'
import { connectToMongoDB, closeMongoDBConnection }from '../src/db.js'
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import {verifyToken } from '../src//middleware/VerifyUser.js'



const userSchema = Joi.object({
  user_email: Joi.string().email().required(),
  user_id: Joi.string().required(),
  user_location: Joi.string().required(),
  user_info: Joi.object(),
  password: Joi.string().required(),
  vehicle_info: Joi.array().items(Joi.string())
});



function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}



router.post('/usersingUp',validateUser, async (req, res) => {
  try {
    const userData = req.body; 
    const {user_email, password} = req.body
    const db = await connectToMongoDB();
    const collection = db.collection('users');
    const validateUser = await collection.findOne({user_email})
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

router.post('/usersingin', async (req, res) => {
  try {
     
    const {user_email, password} = req.body
    const db = await connectToMongoDB();
    const collection = db.collection('users');
    const validateUser = await collection.findOne({user_email})
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




















// Route to update a user by ID
router.put('/users/:userId', validateUser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    const db = await connectToMongoDB();
    const collection = db.collection('users');
    await collection.updateOne({ user_id: userId }, { $set: userData });
    await closeMongoDBConnection();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete a user by ID
router.post('/users/delete', async (req, res) => {
  try {
    const { did} = req.body;
    
    // Convert userId to MongoDB ObjectId
    
    const objectId = new ObjectId(did);
    const db = await connectToMongoDB();
    const collection = db.collection('users');
    
    // Perform delete operation by _id
    const { deletedCount } = await collection.deleteOne({ _id: objectId});

    // Check if the delete operation was successful
    if (deletedCount === 1) {
      await closeMongoDBConnection();
      res.status(200).json({ message: 'User deleted successfully', did });
    } else {
      await closeMongoDBConnection();
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get all users
router.get('/users', async (req, res) => {
  // console.log(res.cookie.token)
  
  try {
    // Connect to the MongoDB database
   const db = await connectToMongoDB();

    // Access the 'users' collection
    const collection = db.collection('users');

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
// router.get('/vehicles', UserController.getAllVehicles);
// router.get('/vehicles/:userId', UserController.getVehiclesByUserId);
// router.get('/deals/:carId', UserController.getDealsByCar);

export default router;
