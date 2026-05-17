const express = require('express');

const router = express.Router();
const clients = new Set();

router.get('/', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

function broadcast(type) {
  for (const res of clients) {
    res.write(`data: ${type}\n\n`);
  }
}

module.exports = { router, broadcast };
