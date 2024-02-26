import express from 'express';
import Joi from 'joi';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { connectToMongoDB, closeMongoDBConnection } from '../src/db.js';
import jwt from 'jsonwebtoken';
const router = express.Router();


// Define Joi schema for admin validation
const adminSchema = Joi.object({
  admin_id: Joi.string().required(),
  password: Joi.string().required()
});

// Middleware function to validate admin data against the schema
const validateAdminData = (req, res, next) => {
  const { error } = adminSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Signup route for admin
router.post('/signup', validateAdminData, async (req, res) => {
  try {
    const userData = req.body; 
    const {admin_email, password} = req.body
    const db = await connectToMongoDB();
    const collection = db.collection('admins');
    const validateUser = await collection.findOne({admin_email})
    // console.log(validateUser)
    if (validateUser){  return res.status(400).send('user is already exist');}
    const hashedPassword = bcryptjs.hashSync(userData.password, 10)
    userData.password= hashedPassword
    await collection.insertOne(userData);
    await closeMongoDBConnection();
    res.status(201).send(userData);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Signin route for admin
router.post('/signin', validateAdminData, async (req, res) => {
  try {
     
    const {admin_email, password} = req.body
    const db = await connectToMongoDB();
    const collection = db.collection('admins');
    const validateUser = await collection.findOne({admin_email})
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
    console.error('Error signing in admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete route for admin
router.post('/admins/delete', async (req, res) => {
  try {
    const { a_id} = req.body;
    
    // Convert userId to MongoDB ObjectId
    
    const objectId = new ObjectId(a_id);
    const db = await connectToMongoDB();
    const collection = db.collection('admins');
    
    // Perform delete operation by _id
    const { deletedCount } = await collection.deleteOne({ _id: ObjectId });

    // Check if the delete operation was successful
    if (deletedCount === 1) {
      await closeMongoDBConnection();
      res.status(200).json({ message: 'Admin deleted successfully', a_id});
    } else {
      await closeMongoDBConnection();
      res.status(404).json({ message: 'admin not found' });
    }
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
