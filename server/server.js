const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const Quote = require('./models/quoteModel');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-vercel-url.vercel.app']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Fetch random quote by category
app.get('/api/quotes/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const quotes = await Quote.aggregate([
      { $match: { category } },
      { $sample: { size: 1 } }
    ]);
    if (quotes.length === 0) {
      return res.status(404).json({ msg: 'No quotes found for this category' });
    }
    res.json(quotes[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));