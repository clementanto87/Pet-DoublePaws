import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/auth.routes';
import petRoutes from './routes/pet.routes';
import sitterRoutes from './routes/sitter.routes';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/sitters', sitterRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Pet Day Care API' });
});



export default app;
