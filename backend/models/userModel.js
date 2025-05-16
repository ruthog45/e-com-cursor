const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    profile: {
      dateOfBirth: Date,
      gender: String,
      location: {
        country: String,
        city: String,
        address: String,
      },
      preferences: {
        categories: [String],
        brands: [String],
        priceRange: {
          min: Number,
          max: Number,
        },
      },
    },
    behavior: {
      lastLogin: Date,
      loginCount: {
        type: Number,
        default: 0,
      },
      deviceInfo: [{
        deviceType: String,
        browser: String,
        lastUsed: Date,
      }],
      searchHistory: [{
        term: String,
        timestamp: Date,
      }],
      viewedProducts: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        viewCount: Number,
        lastViewed: Date,
      }],
      cart: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        addedAt: Date,
      }],
      wishlist: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        addedAt: Date,
      }],
    },
    analytics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
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
      categoryPreferences: [{
        category: String,
        purchaseCount: Number,
        lastPurchase: Date,
      }],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User; 