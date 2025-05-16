const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCustomerInsights,
  getProductPerformance,
  getCustomerBehavior,
  generateRecommendations,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  trackPageView,
  trackProductInteraction,
  trackSearchBehavior,
  updateCustomerSegment,
} = require('../middleware/analyticsMiddleware');
const { ObjectId } = require('mongodb');
const db = require('../config/db');

// Apply protection and admin middleware to all routes
router.use(protect);
router.use(admin);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// Customer analytics routes
router.get('/customer-insights', getCustomerInsights);
router.get('/customer-behavior', getCustomerBehavior);

// Product analytics routes
router.get('/product-performance', getProductPerformance);

// Recommendation routes
router.post('/generate-recommendations', updateCustomerSegment, generateRecommendations);

// Analytics tracking routes
router.post('/track/pageview', trackPageView);
router.post('/track/product/:productId', trackProductInteraction);
router.post('/track/search', trackSearchBehavior);

// Product Management Routes
router.put('/products/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await db.products.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updates },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order Management Routes
router.put('/orders/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shippingInfo } = req.body;
    const order = await db.orders.findOneAndUpdate(
      { _id: ObjectId(id) },
      { 
        $set: { 
          status,
          shippingInfo,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products for admin
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await db.products.find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders for admin
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const orders = await db.orders.find({}).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Temporary route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working' });
});

module.exports = router; 