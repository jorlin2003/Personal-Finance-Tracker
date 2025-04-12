const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// POST a new transaction
router.post('/', async (req, res) => {
  console.log('POST /transactions hit');
  console.log('Body:', req.body);
  console.log('User:', req.user);

  const { type, category, amount, description } = req.body;

  if (!type || !category || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transaction = new Transaction({
      type,
      category,
      amount,
      description,
      user: req.user.id,
    });

    const saved = await transaction.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
