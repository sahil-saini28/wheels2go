import express from 'express';
import userRoutes from './routes/userRoutes.js';
import dealershipRoutes from './routes/dealershipRoutes.js';
import carsRoutes from './routes/carsRoutes.js';
import vehiclesRoutes from './routes/vehiclesRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(express.json());


app.use('/api/user', userRoutes);
app.use('/api/dealership', dealershipRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
