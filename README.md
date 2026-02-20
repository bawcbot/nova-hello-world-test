# Nova Hello World

Persistent click counter with a SQLite-backed leaderboard.

## Requirements
- Node.js 18+
- npm

## Setup
```bash
npm install
```

## Run
```bash
npm start
```
The server starts on [http://localhost:3000](http://localhost:3000).

## Data Storage
Scores are stored in a SQLite database at `data/scores.db`. The file is created automatically on first save and is ignored by git.

## How It Works
- Enter your name, increment the counter, and hit **Save Score** to persist your best score.
- Only the highest score per name is kept.
- The leaderboard always shows the top 10 scores.
