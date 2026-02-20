const state = {
  count: 0,
  leaderboard: [],
};

const buildLayout = () => {
  document.body.innerHTML = '';

  const appContainer = document.createElement('div');
  appContainer.className = 'app-container';

  const title = document.createElement('h1');
  title.textContent = 'Persistent Click Counter';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Your name';
  nameLabel.setAttribute('for', 'name-input');

  const nameInput = document.createElement('input');
  nameInput.id = 'name-input';
  nameInput.placeholder = 'Nova';

  const errorText = document.createElement('p');
  errorText.className = 'error-text';

  const counterDisplay = document.createElement('div');
  counterDisplay.className = 'counter-display';
  counterDisplay.textContent = state.count;

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';

  const clickButton = document.createElement('button');
  clickButton.textContent = 'Click Me';
  clickButton.className = 'primary';

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Score';
  saveButton.className = 'secondary';

  buttonRow.append(clickButton, saveButton);

  const leaderboardSection = document.createElement('section');
  leaderboardSection.className = 'leaderboard';

  const leaderboardTitle = document.createElement('h2');
  leaderboardTitle.textContent = 'Leaderboard';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Rank', 'Name', 'Score', 'Date'].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  leaderboardSection.append(leaderboardTitle, table);

  appContainer.append(
    title,
    nameLabel,
    nameInput,
    errorText,
    counterDisplay,
    buttonRow,
    leaderboardSection
  );

  document.body.appendChild(appContainer);

  clickButton.addEventListener('click', () => {
    state.count += 1;
    counterDisplay.textContent = state.count;
  });

  saveButton.addEventListener('click', async () => {
    errorText.textContent = '';
    const name = nameInput.value.trim();
    if (!name) {
      errorText.textContent = 'Please enter a name before saving.';
      return;
    }

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score: state.count }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to save score');
      }

      state.count = 0;
      counterDisplay.textContent = state.count;
      nameInput.select();
      await loadLeaderboard();
    } catch (error) {
      errorText.textContent = error.message;
    }
  });
};

const loadLeaderboard = async () => {
  try {
    const response = await fetch('/api/leaderboard');
    const data = await response.json();
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    data.scores.forEach((row, index) => {
      const tr = document.createElement('tr');
      const date = row.createdAt ? new Date(row.createdAt).toLocaleString() : '—';
      [index + 1, row.name, row.score, date].forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    if (!data.scores.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.textContent = 'Be the first to save a score!';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  } catch (error) {
    console.error('Failed to load leaderboard', error);
  }
};

const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      background: #0d1117;
      color: #f0f6fc;
    }
    .app-container {
      width: min(480px, 90vw);
      background: #161b22;
      padding: 32px;
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    label {
      font-weight: 600;
    }
    input {
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #30363d;
      background: #0d1117;
      color: #f0f6fc;
      font-size: 16px;
    }
    .counter-display {
      font-size: 64px;
      margin: 12px 0;
      text-align: center;
    }
    .button-row {
      display: flex;
      gap: 12px;
    }
    button {
      flex: 1;
      padding: 12px 18px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
    }
    button.primary {
      background: #238636;
      color: white;
    }
    button.secondary {
      background: #30363d;
      color: white;
    }
    .leaderboard table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid #30363d;
    }
    .error-text {
      color: #ffa198;
      min-height: 1.2em;
    }
  `;
  document.head.appendChild(style);
};

window.addEventListener('DOMContentLoaded', async () => {
  injectStyles();
  buildLayout();
  await loadLeaderboard();
});
