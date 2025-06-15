const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { productId, paymentMethod, transactionId } = req.body;
    const buyerId = req.user._id; // Buyer's ID from authenticated user

    // Fetch product details to get seller's ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure buyer is not the seller of their own product
    if (product.owner.toString() === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot purchase your own listed item.' });
    }

    // Fetch buyer's contact information
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    const newOrder = new Order({
      product: productId,
      buyer: buyerId,
      seller: product.owner, // Seller is the product owner
      paymentMethod,
      transactionId: paymentMethod === 'UPI' ? transactionId : undefined,
      buyerContactInfo: {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
      },
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get orders by buyer (My Purchases)
router.get('/my-purchases', auth, async (req, res) => {
  try {
    const buyerId = req.user._id;
    const orders = await Order.find({ buyer: buyerId })
      .populate('product')
      .populate('seller', 'name email phone') // Populate seller details
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Error fetching purchases', error: error.message });
  }
});

// Get orders by seller (My Sales)
router.get('/my-sales', auth, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orders = await Order.find({ seller: sellerId })
      .populate('product')
      .populate('buyer', 'name email phone') // Populate buyer details
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
});

module.exports = router; 