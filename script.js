'use strict'

const PAIRS_TOTAL = 8;

let firstCard = null;

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
  const leaderboardButton = createElement('button', 'btn', 'Leaderboard');

  buttons.append(newGameButton, leaderboardButton);
  header.append(title, buttons);

  return header;
}

function createStats() {
  const stats = createElement('section', 'stats');

  const moves = createElement('div', 'stat');
  const movesLabel = createElement('span', 'stat-label', 'Moves');
  const movesValue = createElement('span', 'stat-value', '0');

  moves.append(movesLabel, movesValue);

  const pairs = createElement('div', 'stat');
  const pairsLabel = createElement('span', 'stat-label', 'Pairs');
  const pairsValue = createElement(
    'span',
    'stat-value',
    `0 / ${PAIRS_TOTAL}`
  );

  pairs.append(pairsLabel, pairsValue);

  stats.append(moves, pairs);

  return stats;
}

function createCard(imageName) {
  const card = createElement('div', 'card');
  card.dataset.image = imageName;

  const cardInner = createElement('div', 'card-inner');

  const back = createElement('div', 'card-face card-face--back');
  const backImage = document.createElement('img');

  backImage.src = 'assets/cards/card_back.png';
  backImage.alt = '';

  back.append(backImage);

  const front = createElement('div', 'card-face card-face--front');
  const image = document.createElement('img');

  image.src = `assets/cards/${imageName}.png`;
  image.alt = '';

  front.append(image);

  cardInner.append(back, front);
  card.append(cardInner);

  return card;
}

function createBoard() {
  const board = createElement('div', 'board');

  const cards = [];

  for (const imageName of CARD_IMAGES) {
    cards.push(imageName);
    cards.push(imageName);
  }

  shuffle(cards);

  for (const imageName of cards) {
    board.append(createCard(imageName));
  }

  board.addEventListener('click', (event)=>{
    const card = event.target.closest('.card');
    if (!card) return; 
    if (card.classList.contains('is-flipped')) return;
    if (card.classList.contains('is-matched')) return;
    card.classList.add('is-flipped');
    if (firstCard === null) {
        firstCard = card;
        return;
    }

    const first = firstCard;
    const second = card;
    if (first.dataset.image === second.dataset.image){
        first.classList.add('is-matched');
        second.classList.add('is-matched');
        firstCard = null;
    } else {
        setTimeout(() =>{
            first.classList.remove('is-flipped');
            second.classList.remove('is-flipped');
            firstCard = null;
        }, 1000);    
    }
  })

  return board;
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
}

createGame();

