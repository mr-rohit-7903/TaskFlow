const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://task-flow-neon-two-60.vercel.app',
];

// Add CLIENT_URL from env if set
if (process.env.CLIENT_URL) {
  try {
    const origin = new URL(process.env.CLIENT_URL).origin;
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  } catch (e) {
    if (!allowedOrigins.includes(process.env.CLIENT_URL)) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app preview deployment
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TaskFlow API running' }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TaskFlow server running on port ${PORT}`));

// Export for Vercel serverless
module.exports = app;
