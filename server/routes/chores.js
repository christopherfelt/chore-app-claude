const express = require('express');
const db = require('../db');

const router = express.Router();

const listChores = () =>
  db.prepare(`
    SELECT c.*, m.name AS assignee_name
    FROM chores c
    JOIN team_members m ON m.id = c.assignee_id
    ORDER BY c.title
  `).all().map(deserialize);

function deserialize(row) {
  return {
    ...row,
    recurrence_days: row.recurrence_days
      ? (row.recurrence_type === 'weekly' ? JSON.parse(row.recurrence_days) : Number(row.recurrence_days))
      : null,
  };
}

function serializeDays(recurrence_type, recurrence_days) {
  if (recurrence_type === 'weekly' && Array.isArray(recurrence_days)) {
    return JSON.stringify(recurrence_days);
  }
  if (recurrence_type === 'monthly' && recurrence_days != null) {
    return String(recurrence_days);
  }
  return null;
}

router.get('/', (req, res) => {
  res.json(listChores());
});

router.post('/', (req, res) => {
  const { title, description, assignee_id, start_date, end_date, recurrence_type, recurrence_days } = req.body;
  if (!title || !assignee_id || !start_date) {
    return res.status(400).json({ error: 'title, assignee_id, and start_date are required' });
  }
  const type = recurrence_type || 'none';
  const days = serializeDays(type, recurrence_days);

  const result = db.prepare(`
    INSERT INTO chores (title, description, assignee_id, start_date, end_date, recurrence_type, recurrence_days)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title.trim(), description || null, assignee_id, start_date, end_date || null, type, days);

  const chore = db.prepare(`
    SELECT c.*, m.name AS assignee_name FROM chores c
    JOIN team_members m ON m.id = c.assignee_id WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(deserialize(chore));
});

router.put('/:id', (req, res) => {
  const { title, description, assignee_id, start_date, end_date, recurrence_type, recurrence_days } = req.body;
  if (!title || !assignee_id || !start_date) {
    return res.status(400).json({ error: 'title, assignee_id, and start_date are required' });
  }
  const type = recurrence_type || 'none';
  const days = serializeDays(type, recurrence_days);

  const result = db.prepare(`
    UPDATE chores SET title=?, description=?, assignee_id=?, start_date=?, end_date=?,
    recurrence_type=?, recurrence_days=? WHERE id=?
  `).run(title.trim(), description || null, assignee_id, start_date, end_date || null, type, days, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Chore not found' });

  const chore = db.prepare(`
    SELECT c.*, m.name AS assignee_name FROM chores c
    JOIN team_members m ON m.id = c.assignee_id WHERE c.id = ?
  `).get(req.params.id);

  res.json(deserialize(chore));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM chores WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Chore not found' });
  res.status(204).send();
});

module.exports = router;
