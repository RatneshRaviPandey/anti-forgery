const express = require('express');
const router = express.Router();

// Add to cart
router.post('/add', (req, res) => {
  try {
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get cart
router.get('/', (req, res) => {
  try {
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:itemId', (req, res) => {
  try {
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
