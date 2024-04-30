
import 'dotenv/config';
import express from 'express';
import { connectToDatabase } from './models/userModel.mjs';
import authRoutes from './routes/authRoutes.mjs';

const app = express();

app.use(express.json());
app.use(express.static("public"));
 
connectToDatabase();

app.use('/api', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
