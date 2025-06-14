const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const path = require('path');

let gfs;
mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images'
  });
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    // Create URL for the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Serve images
router.get('/image/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving image:', err);
        res.status(404).json({ message: 'Image not found' });
      }
    });
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image', error: error.message });
  }
});

// Create a new product
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      owner: req.user._id
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// Get all products with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get products listed by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ owner: req.params.userId })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Error fetching user products', error: error.message });
  }
});

// Delete image
router.delete('/image/:id', auth, async (req, res) => {
  try {
    await gfs.delete(new mongoose.Types.ObjectId(req.params.id));
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

// Mark a product as sold
router.put('/:id/mark-sold', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id; // Authenticated user's ID
    const { buyerId } = req.body; // Get the buyer ID from request body

    if (!buyerId) {
      return res.status(400).json({ message: 'Buyer ID is required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the authenticated user is the owner of the product
    if (product.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this product as sold' });
    }

    if (product.isSold) {
      return res.status(400).json({ message: 'Product is already marked as sold' });
    }

    // Update product with sold status and buyer information
    product.isSold = true;
    product.soldTo = buyerId; // Store the buyer's ID
    await product.save();

    res.json({ message: 'Product marked as sold successfully', product });
  } catch (error) {
    console.error('Error marking product as sold:', error);
    res.status(500).json({ message: 'Error marking product as sold', error: error.message });
  }
});

module.exports = router; 