# Nova Persistent Click Counter Web App

## Description
A simple persistent click counter with a leaderboard using Node.js and SQLite.

## Requirements
- Node.js v18+
- npm

## Setup
Run:
```
npm install
```

## Run
Start the server with:
```
npm start
```
Then open http://localhost:3000 in your browser.

## Data Storage
Scores are stored in SQLite at `data/scores.db`.

## How to Use
1. Enter your name into the input box.
2. Click the **Click Me** button to increase your count.
3. Click **Save Score** to save your highest score under your name.
4. Leaderboard shows the top 10 highest scores persistently.

## Demo Validation
- Enter **Test Co**, click 5 times, save. Leaderboard shows 5.
- Enter **Test Co**, click 3 times, save. Leaderboard still shows 5 (best score rule).
- Enter **Another**, click 7 times, save. Leaderboard shows Another=7 above Test Co=5.
