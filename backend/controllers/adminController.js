const asyncHandler = require('express-async-handler');
const Analytics = require('../models/analyticsModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const db = require('../config/db');
const { ObjectId } = require('mongodb');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [customers, orders] = await Promise.all([
      db.users.find({}).toArray(),
      db.orders.find({}).toArray()
    ]);

    // Calculate active customers (made purchase in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeCustomers = customers.filter(customer => {
      const lastOrder = orders.find(order => order.userId === customer._id.toString());
      return lastOrder && new Date(lastOrder.orderDate) > thirtyDaysAgo;
    }).length;

    // Calculate retention rate
    const previousPeriodCustomers = customers.filter(customer => {
      const lastOrder = orders.find(order => order.userId === customer._id.toString());
      return lastOrder && new Date(lastOrder.orderDate) > new Date(thirtyDaysAgo - 30);
    }).length;

    const retentionRate = previousPeriodCustomers ? activeCustomers / previousPeriodCustomers : 0;

    res.json({
      activeCustomers,
      retentionRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get customer insights
// @route   GET /api/admin/customer-insights
// @access  Private/Admin
const getCustomerInsights = asyncHandler(async (req, res) => {
  try {
    const [customers, orders] = await Promise.all([
      db.users.find({}).toArray(),
      db.orders.find({}).toArray()
    ]);

    // Calculate customer segments and metrics
    const customerProfiles = customers.map(customer => {
      const customerOrders = orders.filter(order => order.userId === customer._id.toString());
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const purchaseFrequency = customerOrders.length / 12; // orders per month
      const lastPurchase = customerOrders.length > 0 
        ? Math.max(...customerOrders.map(order => new Date(order.orderDate)))
        : null;

      // Determine customer segment
      let segment = 'occasional';
      if (totalSpent > 1000 && purchaseFrequency > 2) {
        segment = 'high_value';
      } else if (totalSpent > 500 || purchaseFrequency > 1) {
        segment = 'regular';
      } else if (!lastPurchase || new Date() - lastPurchase > 90 * 24 * 60 * 60 * 1000) {
        segment = 'at_risk';
      }

      return {
        _id: customer._id,
        name: customer.name,
        segment,
        lifetimeValue: totalSpent,
        purchaseFrequency,
        lastPurchase,
      };
    });

    // Calculate segment counts
    const segments = customerProfiles.reduce((acc, profile) => {
      acc[profile.segment] = (acc[profile.segment] || 0) + 1;
      return acc;
    }, {});

    res.json({
      customers: customerProfiles,
      segments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get product performance
// @route   GET /api/admin/product-performance
// @access  Private/Admin
const getProductPerformance = asyncHandler(async (req, res) => {
  try {
    const [products, orders, views] = await Promise.all([
      db.products.find({}).toArray(),
      db.orders.find({}).toArray(),
      db.analytics.find({ type: 'product_view' }).toArray()
    ]);

    const recommendations = products.map(product => {
      // Calculate views
      const productViews = views.filter(v => v.productId === product._id.toString()).length;
      
      // Calculate purchases
      const productPurchases = orders.filter(order => 
        order.items.some(item => item.productId === product._id.toString())
      ).length;

      // Calculate conversion rate
      const conversionRate = productViews ? productPurchases / productViews : 0;

      // Calculate recommendation score (example algorithm)
      const score = (
        (conversionRate * 0.4) + 
        (productViews / Math.max(...views.map(v => v.count)) * 0.3) +
        (productPurchases / Math.max(...orders.map(o => o.items.length)) * 0.3)
      );

      // Determine target segments based on purchase patterns
      const targetSegments = [];
      if (product.price > 100) targetSegments.push('high_value');
      if (conversionRate > 0.1) targetSegments.push('regular');
      if (productViews > 100) targetSegments.push('trending');

      return {
        productId: product._id,
        productName: product.name,
        category: product.category,
        score,
        conversionRate,
        targetSegments,
      };
    }).sort((a, b) => b.score - a.score);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get customer behavior analysis
// @route   GET /api/admin/customer-behavior
// @access  Private/Admin
const getCustomerBehavior = asyncHandler(async (req, res) => {
  try {
    const [searchLogs, productViews] = await Promise.all([
      db.analytics.find({ type: 'search' }).toArray(),
      db.analytics.find({ type: 'product_view' }).toArray()
    ]);

    // Analyze search terms
    const searchTerms = searchLogs.reduce((acc, log) => {
      const term = log.searchTerm.toLowerCase();
      const existing = acc.find(item => item.term === term);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ term, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count).slice(0, 10);

    // Analyze product views
    const viewedProducts = productViews.reduce((acc, view) => {
      const existing = acc.find(item => item.productId === view.productId);
      if (existing) {
        existing.views++;
      } else {
        acc.push({ 
          productId: view.productId,
          name: view.productName,
          views: 1 
        });
      }
      return acc;
    }, []).sort((a, b) => b.views - a.views).slice(0, 10);

    res.json({
      searchTerms,
      viewedProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Generate recommendations
// @route   POST /api/admin/generate-recommendations
// @access  Private/Admin
const generateRecommendations = asyncHandler(async (req, res) => {
  try {
    const [products, orders, views] = await Promise.all([
      db.products.find({}).toArray(),
      db.orders.find({}).toArray(),
      db.analytics.find({}).toArray()
    ]);

    // Implement collaborative filtering or other recommendation algorithms
    const recommendations = products.map(product => {
      // Calculate basic metrics
      const productViews = views.filter(v => v.productId === product._id.toString()).length;
      const productPurchases = orders.filter(order => 
        order.items.some(item => item.productId === product._id.toString())
      ).length;

      // Find related products (products often bought together)
      const relatedProducts = orders
        .filter(order => order.items.some(item => item.productId === product._id.toString()))
        .flatMap(order => order.items)
        .filter(item => item.productId !== product._id.toString())
        .reduce((acc, item) => {
          acc[item.productId] = (acc[item.productId] || 0) + 1;
          return acc;
        }, {});

      // Calculate recommendation score
      const score = (
        (productPurchases * 0.4) +
        (productViews * 0.3) +
        (Object.keys(relatedProducts).length * 0.3)
      ) / Math.max(1, productViews);

      return {
        productId: product._id,
        productName: product.name,
        category: product.category,
        score,
        relatedProducts: Object.entries(relatedProducts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([id]) => id),
      };
    }).sort((a, b) => b.score - a.score);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  getDashboardStats,
  getCustomerInsights,
  getProductPerformance,
  getCustomerBehavior,
  generateRecommendations,
}; 