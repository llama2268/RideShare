import express from 'express';
import bodyParser from 'body-parser';
import riderRoutes from '../routes/rider';
import userRoutes from '../routes/user';
import reviewRoutes from '../routes/review';
import dotenv from 'dotenv';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Middleware for parsing JSON requests

// Set up your routes
app.use('/api/rider', riderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/review', reviewRoutes);
app.get('/health', (req, res) => {
  res.status(200).send("OK")
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});