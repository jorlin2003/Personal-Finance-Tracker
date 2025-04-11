const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Create transaction
router.post('/', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user._id
    });
    await transaction.save();
    res.status(201).send(transaction);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    res.send(transactions);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;