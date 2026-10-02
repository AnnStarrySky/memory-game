'use strict';

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);

  node.className = className;
  node.textContent = text;

  return node;
}

function createHeader() {
  const header = el('header', 'header');

  const title = el('h1', 'header-title', 'Memory Game');

  const actions = el('div', 'header-actions');

  const newGameBtn = el('button', 'btn', 'New Game');

  const leadersBtn = el('button', 'btn', 'Leaderboard');

  actions.append(newGameBtn, leadersBtn);
  header.append(title, actions);

  return header;
}

function createApp() {
  const app = el('div');
  app.id = 'app';
  app.append(createHeader());
  document.body.append(app);
  return app;
}

createApp();