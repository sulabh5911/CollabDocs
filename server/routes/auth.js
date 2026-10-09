const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/auth/users - list demo users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

module.exports = router;
