const express = require('express');
const router = express.Router();
const db = require('../sqlite');

router.get('/', (req, res) => {
  const query = 'SELECT * FROM auteurs';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

module.exports = router;

