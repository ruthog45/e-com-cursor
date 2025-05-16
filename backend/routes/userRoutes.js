const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUserAnalytics,
  getUsers,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin, trackUserActivity } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, trackUserActivity, getUserProfile)
  .put(protect, trackUserActivity, updateUserProfile);
router.route('/analytics').get(protect, trackUserActivity, getUserAnalytics);
router.route('/:id').delete(protect, admin, deleteUser);

// Temporary route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

module.exports = router; 