const fs = require('fs');
const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'scores.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.prepare(`
  CREATE TABLE IF NOT EXISTS scores (
    name TEXT PRIMARY KEY,
    score INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  )
`).run();

const getTopScores = db.prepare(`
  SELECT name, score, updated_at AS createdAt
  FROM scores
  ORDER BY score DESC, datetime(updated_at) DESC
  LIMIT 10
`);
const getScoreByName = db.prepare('SELECT score FROM scores WHERE name = ?');
const insertScore = db.prepare('INSERT INTO scores (name, score, updated_at) VALUES (?, ?, ?)');
const updateScore = db.prepare('UPDATE scores SET score = ?, updated_at = ? WHERE name = ?');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const htmlPath = path.join(__dirname, 'public', 'index.html');
const getHtmlWithScript = () => {
  const baseHtml = fs.readFileSync(htmlPath, 'utf8');
  if (baseHtml.includes('<script type="module" src="/app.js"></script>')) {
    return baseHtml;
  }
  return baseHtml.replace('</body>', '<script type="module" src="/app.js"></script></body>');
};

app.get('/api/leaderboard', (req, res) => {
  const scores = getTopScores.all();
  res.json({ scores });
});

app.post('/api/save', (req, res) => {
  const { name, score } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Score must be a positive number.' });
  }

  const trimmedName = name.trim();
  const timestamp = new Date().toISOString();
  const existing = getScoreByName.get(trimmedName);

  if (!existing) {
    insertScore.run(trimmedName, score, timestamp);
    return res.json({ status: 'created', score });
  }

  if (score > existing.score) {
    updateScore.run(score, timestamp, trimmedName);
    return res.json({ status: 'updated', score });
  }

  return res.json({ status: 'ignored', reason: 'Existing score is higher' });
});

app.get('/', (req, res) => {
  res.type('html').send(getHtmlWithScript());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Nova Hello World server running on http://localhost:${PORT}`);
});
