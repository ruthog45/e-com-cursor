const asyncHandler = require('express-async-handler');
const Analytics = require('../models/analyticsModel');
const User = require('../models/userModel');
const db = require('../config/db');
const { ObjectId } = require('mongodb');

const trackPageView = asyncHandler(async (req, res, next) => {
  try {
    const { userId, page, timestamp } = req.body;
    
    await db.analytics.insertOne({
      type: 'page_view',
      userId,
      page,
      timestamp: new Date(timestamp),
    });

    next();
  } catch (error) {
    next(error);
  }
});

const trackProductInteraction = asyncHandler(async (req, res, next) => {
  try {
    const { userId, productId, action, timestamp } = req.body;
    const product = await db.products.findOne({ _id: ObjectId(productId) });
    
    await db.analytics.insertOne({
      type: 'product_view',
      userId,
      productId,
      productName: product.name,
      action, // view, add_to_cart, purchase
      timestamp: new Date(timestamp),
    });

    next();
  } catch (error) {
    next(error);
  }
});

const trackSearchBehavior = asyncHandler(async (req, res, next) => {
  try {
    const { userId, searchTerm, resultCount, timestamp } = req.body;
    
    await db.analytics.insertOne({
      type: 'search',
      userId,
      searchTerm,
      resultCount,
      timestamp: new Date(timestamp),
    });

    next();
  } catch (error) {
    next(error);
  }
});

const updateCustomerSegment = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    // Get user's orders
    const orders = await db.orders.find({ userId }).toArray();
    
    // Calculate metrics
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    const lastOrder = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0];
    
    // Determine segment
    let segment = 'occasional';
    if (totalSpent > 1000 && orderCount > 24) { // More than 2 orders per month
      segment = 'high_value';
    } else if (totalSpent > 500 || orderCount > 12) { // More than 1 order per month
      segment = 'regular';
    } else if (!lastOrder || new Date() - new Date(lastOrder.orderDate) > 90 * 24 * 60 * 60 * 1000) {
      segment = 'at_risk';
    }
    
    // Update user's segment
    await db.users.updateOne(
      { _id: ObjectId(userId) },
      { $set: { segment } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

const generateRecommendations = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    // Get user's interactions
    const interactions = await db.analytics
      .find({ userId, type: 'product_view' })
      .toArray();
    
    // Get user's orders
    const orders = await db.orders
      .find({ userId })
      .toArray();
    
    // Get user's segment
    const user = await db.users.findOne({ _id: ObjectId(userId) });
    
    // Store this data in the request for the next middleware
    req.analyticsData = {
      interactions,
      orders,
      userSegment: user.segment,
    };

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  trackPageView,
  trackProductInteraction,
  trackSearchBehavior,
  updateCustomerSegment,
  generateRecommendations,
}; 