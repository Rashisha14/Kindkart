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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
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

module.exports = router; 