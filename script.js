'use strict'

const RESULTS_KEY = 'memory-game-results';
const PAIRS_TOTAL = 8;

let firstCard = null;
let isLocked = false;

let movesValueEl = null;
let pairsValueEl = null;
let moves = 0;
let pairs = 0;

let isGameOver = false;

let boardEl = null;
let flipTimeoutId = null;
let winModal = null;

const CARD_IMAGES = [
  'creeper',
  'enderman',
  'skeleton',
  'zombie',
  'ghast',
  'iron-golem',
  'wolf',
  'spider'
];

function loadResults(){
    const results = localStorage.getItem(RESULTS_KEY);
    if (results === null) return [];
    return JSON.parse(results);
}

function saveResult(moves){
    const results = loadResults();
    const resultsObj = {
        moves: moves,
        date: Date.now()
    }
    results.push(resultsObj);
    results.sort((a, b) => a.moves - b.moves || a.date - b.date);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 10)));
}

function getTopResults(){
    const results = loadResults();
    return results.slice(0, 10);
}

function formatDate(dateValue){
    const date = new Date(dateValue);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function createLeaderboardContent() {
  const results = getTopResults();

  if (results.length === 0) {
    const empty = createElement('p', 'leaderboard-empty', 'No results yet');
    return empty;
  }

  const table = createElement('table', 'leaderboard-table');

  const thead = createElement('thead');
  const headRow = createElement('tr');
  headRow.append(
    createElement('th', '', 'Place'),
    createElement('th', '', 'Moves'),
    createElement('th', '', 'Date')
  );
  thead.append(headRow);

  const tbody = createElement('tbody');
  results.forEach((entry, index) => {
    const row = createElement('tr');
    row.append(
      createElement('td', '', String(index + 1)),
      createElement('td', '', String(entry.moves)),
      createElement('td', '', formatDate(entry.date))
    );
    tbody.append(row);
  });

  table.append(thead, tbody);
  return table;
}

function openLeaderboard(){
    const content = createLeaderboardContent();
    const modal = createModal({ title: 'Leaderboard', body: content, actions: [
        { label: 'Close', onClick: () => modal.close() },
    ] });
    document.body.append(modal.dialog);
    modal.open();
}

function createElement(tag, className = '', text = '') {
  const node = document.createElement(tag);

  node.className = className;
  node.textContent = text;

  return node;
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];
  }
}

function createHeader() {
  const header = createElement('header', 'header');

  const title = createElement('h1', 'header-title', 'Memory Game');

  const buttons = createElement('div', 'header-actions');

  const newGameButton = createElement('button', 'btn', 'New Game');
  newGameButton.addEventListener('click', startNewGame);
  const leaderboardButton = createElement('button', 'btn', 'Leaderboard');
  leaderboardButton.addEventListener('click', openLeaderboard);

  buttons.append(newGameButton, leaderboardButton);
  header.append(title, buttons);

  return header;
}

function createStats() {
  const stats = createElement('section', 'stats');

  const moves = createElement('div', 'stat');
  const movesLabel = createElement('span', 'stat-label', 'Moves');
  movesValueEl = createElement('span', 'stat-value', '0');

  moves.append(movesLabel, movesValueEl);

  const pairs = createElement('div', 'stat');
  const pairsLabel = createElement('span', 'stat-label', 'Pairs');
  pairsValueEl = createElement(
    'span',
    'stat-value',
    `0 / ${PAIRS_TOTAL}`
  );

  pairs.append(pairsLabel, pairsValueEl);

  stats.append(moves, pairs);

  return stats;
}

function createModal({ title, body, actions }) {
  const dialog = createElement('dialog', 'modal');
  const content = createElement('div', 'modal-content');
  const titleEl = createElement('h2', 'modal-title', title);
  const bodyEl = createElement('div', 'modal-body');
  if (typeof body === 'string') {
    bodyEl.textContent = body;
  } else {
    bodyEl.append(body);
  }
  const actionsEl = createElement('div', 'modal-actions');
  for (const action of actions) {
    const btn = createElement('button', 'btn', action.label);
    btn.addEventListener('click', action.onClick);
    actionsEl.append(btn);
  }

  content.append(titleEl, bodyEl, actionsEl);
  dialog.append(content);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('no-scroll');
  });

  function open() {
    document.body.classList.add('no-scroll');
    dialog.showModal();
  }

  function close() {
    dialog.close();
  }

  return { dialog, open, close };
}

function updateCounters(){
    movesValueEl.textContent = String(moves);
    pairsValueEl.textContent = pairs + ' / ' + PAIRS_TOTAL;
}

function createCard(imageName) {
  const card = createElement('div', 'card');
  card.dataset.image = imageName;

  const cardInner = createElement('div', 'card-inner');

  const back = createElement('div', 'card-face card-face--back');
  const backImage = document.createElement('img');

  backImage.src = 'assets/cards/card_back.png';
  backImage.alt = '';
  backImage.draggable = false;

  back.append(backImage);

  const front = createElement('div', 'card-face card-face--front');
  const image = document.createElement('img');

  image.src = `assets/cards/${imageName}.png`;
  image.alt = '';
  image.draggable = false;

  front.append(image);

  cardInner.append(back, front);
  card.append(cardInner);

  return card;
}

function startNewGame(){
    clearTimeout(flipTimeoutId);
    flipTimeoutId = null;
    if (winModal) winModal.close();
    firstCard = null;
    isLocked = false;
    isGameOver = false;
    moves = 0;
    pairs = 0;
    updateCounters();
    renderBoard(boardEl);
}

function renderBoard(board){
    board.replaceChildren();
    const cards = [];

  for (const imageName of CARD_IMAGES) {
    cards.push(imageName);
    cards.push(imageName);
  }

  shuffle(cards);

  for (const imageName of cards) {
    board.append(createCard(imageName));
  }
}

function createBoard() {
  const board = createElement('div', 'board');
  boardEl = board;

  board.addEventListener('click', (event)=>{
    const card = event.target.closest('.card');
    if (!card) return;
    if (isGameOver) return;
    if (isLocked) return;

    if (card.classList.contains('is-flipped')) return;
    if (card.classList.contains('is-matched')) return;
    card.classList.add('is-flipped');
    if (firstCard === null) {
        firstCard = card;
        return;
    }
    moves++;
    updateCounters();

    const first = firstCard;
    const second = card;
    if (first.dataset.image === second.dataset.image){
        first.classList.add('is-matched');
        second.classList.add('is-matched');
        firstCard = null;
        pairs++;
        updateCounters();
        checkWin();
    } else {
        isLocked = true;
        flipTimeoutId = setTimeout(() =>{
            first.classList.remove('is-flipped');
            second.classList.remove('is-flipped');
            firstCard = null;
            isLocked = false;
            flipTimeoutId = null;
        }, 1000);    
    }
  })
  renderBoard(board);
  return board;
}

function checkWin(){
    if (pairs < PAIRS_TOTAL) return;
    saveResult(moves);
    isGameOver = true;
    winModal = createModal({
        title: 'You win!',
        body: `Moves: ${moves}`,
        actions: [
            { label: 'New Game', onClick: () => {
                winModal.close();
                startNewGame();
            } },
            { label: 'Close', onClick: () => winModal.close() },
        ],  
    })
    document.body.append(winModal.dialog);
    winModal.open();
}

function createGame() {
  const app = createElement('div', '');
  app.id = 'app';

  app.append(
    createHeader(),
    createStats(),
    createBoard()
  );

  document.body.append(app);
  updateCounters();
}

createGame();