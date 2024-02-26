import express from 'express';
const router = express.Router();

// Import controllers
// import AuthController from '../controllers/AuthController.js';

// Define routes
router.post('/register', (req, res)=>{
  res.send("hellow from the wheels2go ")
});
router.post('/login', (req, res)=>{
  res.send("hellow from the wheels2go ")
});
router.post('/logout', (req, res)=>{
  res.send("hellow from the wheels2go ")
});
router.post('/changePassword', (req, res)=>{
  res.send("hellow from the wheels2go ")
});

export default router;
