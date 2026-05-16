const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const members = db.prepare('SELECT * FROM team_members ORDER BY name').all();
  res.json(members);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = db.prepare('INSERT INTO team_members (name) VALUES (?)').run(name.trim());
    const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A member with that name already exists' });
    }
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Member not found' });
    res.status(204).send();
  } catch (err) {
    if (err.message.includes('FOREIGN KEY')) {
      return res.status(409).json({ error: 'Cannot delete member with assigned chores. Reassign their chores first.' });
    }
    throw err;
  }
});

module.exports = router;
