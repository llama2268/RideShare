import express from 'express';
import bodyParser from 'body-parser';
import riderRoutes from './routes/rider';
import userRoutes from './routes/user';
import reviewRoutes from './routes/review';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { registerClerkUser } from './middleware/registerClerkUser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(clerkMiddleware());
app.use(registerClerkUser);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Set up your routes

app.use('/api/rider', riderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/review', reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});