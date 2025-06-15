const express = require('express');
const router = express.Router();
const BuyInterest = require('../models/BuyInterest');
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Record a new buy interest
router.post('/', auth, async (req, res) => {
  try {
    const { productId, paymentMethod } = req.body;
    const buyerId = req.user._id; // Buyer ID from authenticated user

    // Optional: Check if the product exists and is not owned by the buyer
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.owner.toString() === buyerId.toString()) {
      return res.status(400).json({ message: 'Cannot express interest in your own product' });
    }

    // Check if a buy interest already exists for this product by this buyer
    const existingInterest = await BuyInterest.findOne({ product: productId, buyer: buyerId });
    if (existingInterest) {
      return res.status(400).json({ message: 'You have already expressed interest in this product' });
    }

    const buyInterest = new BuyInterest({
      product: productId,
      buyer: buyerId,
      paymentMethod: paymentMethod
    });

    await buyInterest.save();

    res.status(201).json({
      message: 'Buy interest recorded successfully',
      buyInterest
    });
  } catch (error) {
    console.error('Error recording buy interest:', error);
    res.status(500).json({ message: 'Error recording buy interest', error: error.message });
  }
});

// Get all buy interests for a seller's products
router.get('/seller-products', auth, async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Find all products owned by the seller
    const sellerProducts = await Product.find({ owner: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id);

    // Find all buy interests for these products
    const buyInterests = await BuyInterest.find({ product: { $in: productIds } })
      .populate('product', 'title imageUrl') // Populate product details
      .populate('buyer', 'name email phone'); // Populate buyer details

    res.json(buyInterests);
  } catch (error) {
    console.error('Error fetching seller buy interests:', error);
    res.status(500).json({ message: 'Error fetching seller buy interests', error: error.message });
  }
});

module.exports = router; 