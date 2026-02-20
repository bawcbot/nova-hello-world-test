const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new Database(path.join(__dirname, 'data', 'scores.db'), { verbose: console.log });
db.exec(`CREATE TABLE IF NOT EXISTS scores (
  name TEXT PRIMARY KEY,
  score INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);`);

const insertOrUpdate = db.prepare(`
INSERT INTO scores (name, score, createdAt) VALUES (?, ?, ?)
ON CONFLICT(name) DO UPDATE SET score=excluded.score, createdAt=excluded.createdAt
WHERE excluded.score > scores.score;
`);

const getTopScores = db.prepare(`
SELECT name, score, createdAt FROM scores ORDER BY score DESC, createdAt ASC LIMIT 10;
`);

app.get('/api/leaderboard', (req, res) => {
  const scores = getTopScores.all();
  res.json({ scores });
});

app.post('/api/save', (req, res) => {
  const { name, score } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative number.' });
  }
  const trimmed = name.trim();
  const now = new Date().toISOString();

  try {
    const info = insertOrUpdate.run(trimmed, score, now);
    res.json({ status: 'success' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
