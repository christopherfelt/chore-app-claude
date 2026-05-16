const express = require('express');
const dayjs = require('dayjs');
const db = require('../db');

const router = express.Router();

function* generateOccurrences(chore, windowStart, windowEnd) {
  const effectiveStart = chore.start_date > windowStart ? chore.start_date : windowStart;
  const effectiveEnd = chore.end_date && chore.end_date < windowEnd ? chore.end_date : windowEnd;

  if (effectiveStart > effectiveEnd) return;

  let cursor = dayjs(effectiveStart);
  const end = dayjs(effectiveEnd);

  while (!cursor.isAfter(end)) {
    if (isOccurrence(chore, cursor)) {
      yield cursor.format('YYYY-MM-DD');
    }
    cursor = cursor.add(1, 'day');
  }
}

function isOccurrence(chore, cursor) {
  switch (chore.recurrence_type) {
    case 'none':
      return cursor.format('YYYY-MM-DD') === chore.start_date;
    case 'daily':
      return true;
    case 'weekly': {
      const days = JSON.parse(chore.recurrence_days || '[]');
      return days.includes(cursor.day());
    }
    case 'monthly': {
      const targetDay = parseInt(chore.recurrence_days || '1', 10);
      return cursor.date() === targetDay;
    }
    default:
      return false;
  }
}

router.get('/', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params are required' });
  }

  const chores = db.prepare(`
    SELECT c.*, m.name AS assignee_name
    FROM chores c
    JOIN team_members m ON m.id = c.assignee_id
    WHERE c.start_date <= ? AND (c.end_date IS NULL OR c.end_date >= ?)
  `).all(end, start);

  const completions = db.prepare(`
    SELECT chore_id, date, completed_at
    FROM chore_completions
    WHERE date BETWEEN ? AND ?
  `).all(start, end);

  const completionMap = new Map(
    completions.map(c => [`${c.chore_id}_${c.date}`, c])
  );

  const events = [];
  for (const chore of chores) {
    for (const date of generateOccurrences(chore, start, end)) {
      const key = `${chore.id}_${date}`;
      const completion = completionMap.get(key);
      events.push({
        id: key,
        title: chore.title,
        start: date,
        allDay: true,
        extendedProps: {
          chore_id: chore.id,
          date,
          assignee_name: chore.assignee_name,
          description: chore.description,
          completed: !!completion,
          completed_at: completion?.completed_at ?? null,
        },
      });
    }
  }

  res.json(events);
});

module.exports = router;
