'use strict'

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
  const bodyEl = createElement('div', 'modal-body', body);
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
        console.log('checkWin:', pairs);
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
