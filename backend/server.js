const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const buyInterestRoutes = require('./routes/buyInterests');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
const allowedOrigins = [
  'http://localhost:19000',
  'http://localhost:19001',
  'http://localhost:19002',
  'exp://localhost:19000',
  'http://192.168.1.37:19000',
  'http://192.168.1.37:19001',
  'http://192.168.1.37:19002',
  'exp://192.168.1.37:19000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Rejected Origin:', origin);
      console.log('Allowed Origins:', allowedOrigins);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.headers.authorization) {
    console.log('Authorization:', req.headers.authorization.substring(0, 20) + '...');
  }
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (!req.path.includes('/upload')) {
    console.log('Body:', req.body);
  }
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kindkart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/buy-interests', buyInterestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const interfaces = require('os').networkInterfaces();
  const addresses = [];
  
  for (let k in interfaces) {
    for (let k2 in interfaces[k]) {
      let address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  
  console.log('\n=== Server Information ===');
  console.log(`Server is running on port ${PORT}`);
  console.log('\nAccessible at:');
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network addresses:`);
  addresses.forEach(addr => console.log(`  http://${addr}:${PORT}`));
  console.log('\n=== CORS Configuration ===');
  console.log('Allowed origins in development:', 'All Origins');
  console.log('Allowed origins in production:', allowedOrigins);
  console.log('======================\n');
}); 