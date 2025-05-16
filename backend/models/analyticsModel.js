const mongoose = require('mongoose');

const analyticsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    sessionData: {
      sessionId: String,
      startTime: Date,
      endTime: Date,
      duration: Number,
      deviceInfo: {
        deviceType: String,
        browser: String,
        platform: String,
        screenResolution: String,
      },
      location: {
        country: String,
        city: String,
        region: String,
        ip: String,
      },
    },
    pageViews: [{
      path: String,
      title: String,
      timestamp: Date,
      duration: Number,
      referrer: String,
      exitPage: Boolean,
    }],
    productInteractions: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      action: {
        type: String,
        enum: ['view', 'click', 'add_to_cart', 'add_to_wishlist', 'purchase'],
      },
      timestamp: Date,
      duration: Number,
      source: String,
    }],
    searchBehavior: [{
      query: String,
      timestamp: Date,
      resultCount: Number,
      selectedProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      filters: [{
        name: String,
        value: String,
      }],
    }],
    cartActivity: [{
      action: {
        type: String,
        enum: ['add', 'remove', 'update', 'abandon', 'checkout'],
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      timestamp: Date,
    }],
    recommendations: {
      personalizedProducts: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        score: Number,
        reason: String,
      }],
      categoryAffinities: [{
        category: String,
        score: Number,
      }],
      brandAffinities: [{
        brand: String,
        score: Number,
      }],
    },
    customerSegment: {
      type: String,
      enum: ['new', 'returning', 'loyal', 'at_risk', 'lost'],
      default: 'new',
    },
    metrics: {
      lifetimeValue: {
        type: Number,
        default: 0,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
      purchaseFrequency: {
        type: Number,
        default: 0,
      },
      lastPurchaseDate: Date,
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
analyticsSchema.index({ 'sessionData.sessionId': 1 });
analyticsSchema.index({ user: 1 });
analyticsSchema.index({ 'productInteractions.productId': 1 });
analyticsSchema.index({ customerSegment: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics; 