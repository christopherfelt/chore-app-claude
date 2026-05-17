const express = require('express');
const db = require('../db');
const { broadcast } = require('./sse');

const router = express.Router();

router.post('/', (req, res) => {
  const { chore_id, date } = req.body;
  if (!chore_id || !date) {
    return res.status(400).json({ error: 'chore_id and date are required' });
  }
  db.prepare(`
    INSERT OR IGNORE INTO chore_completions (chore_id, date) VALUES (?, ?)
  `).run(chore_id, date);
  const row = db.prepare('SELECT * FROM chore_completions WHERE chore_id = ? AND date = ?').get(chore_id, date);
  broadcast('completions');
  res.status(201).json(row);
});

router.delete('/', (req, res) => {
  const { chore_id, date } = req.body;
  if (!chore_id || !date) {
    return res.status(400).json({ error: 'chore_id and date are required' });
  }
  db.prepare('DELETE FROM chore_completions WHERE chore_id = ? AND date = ?').run(chore_id, date);
  broadcast('completions');
  res.status(204).send();
});

module.exports = router;
