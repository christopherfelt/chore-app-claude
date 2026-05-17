const express = require('express');
const cors = require('cors');
const path = require('path');

const membersRouter = require('./routes/members');
const choresRouter = require('./routes/chores');
const calendarRouter = require('./routes/calendar');
const completionsRouter = require('./routes/completions');
const { router: sseRouter } = require('./routes/sse');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/chores', choresRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/completions', completionsRouter);
app.use('/api/events', sseRouter);

// Serve built client in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
