const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    variants: [{
      name: String,
      sku: String,
      price: Number,
      countInStock: Number,
      attributes: [{
        name: String,
        value: String,
      }],
    }],
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      purchases: {
        type: Number,
        default: 0,
      },
      cartAdds: {
        type: Number,
        default: 0,
      },
      wishlistAdds: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
      viewHistory: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: Date,
      }],
      purchaseHistory: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        quantity: Number,
        timestamp: Date,
      }],
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    recommendations: {
      similarProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
      complementaryProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 