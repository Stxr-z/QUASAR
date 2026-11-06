const cursor = document.querySelector('.cursor-star');
const dialog = document.querySelector('#game-dialog');
const gameContent = document.querySelector('#game-content');
const dialogTitle = document.querySelector('#dialog-title');
let activeTimer;

const quotes = [
  'Somewhere, the universe is waiting to be searched.',
  'The night is just a map with the lights turned down.',
  'Keep looking up. There is always more sky.',
  'Even the smallest spark has its own orbit.',
  'Out here, every ending is another beginning.'
];

document.querySelector('#space-quote').textContent = quotes[new Date().getDate() % quotes.length];

document.addEventListener('pointermove', (event) => {
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
  document.body.classList.add('pointer-ready');
});

document.addEventListener('pointerdown', () => document.body.classList.add('cursor-pressed'));
document.addEventListener('pointerup', () => document.body.classList.remove('cursor-pressed'));

document.querySelectorAll('.nav-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const viewName = tab.dataset.view;
    document.querySelectorAll('.nav-tab').forEach((item) => {
      item.classList.toggle('is-active', item === tab);
      if (item === tab) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    document.querySelectorAll('.view').forEach((view) => {
      const active = view.id === `view-${viewName}`;
      view.hidden = !active;
      view.classList.toggle('is-visible', active);
    });
  });
});

document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.querySelector('#search-input').value.trim();
  if (!query) {
    document.querySelector('#search-input').focus();
    return;
  }

  const isUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i.test(query);
  const destination = isUrl
    ? `https://${query.replace(/^https?:\/\//i, '')}`
    : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  window.open(destination, '_blank', 'noopener,noreferrer');
});

function showGame(title, markup) {
  clearTimeout(activeTimer);
  dialogTitle.textContent = title;
  gameContent.innerHTML = markup;
  dialog.showModal();
}

function startStarCatch() {
  let score = 0;
  let seconds = 15;
  showGame('Star Catch', '<p>Catch the star before the timer ends.</p><div class="game-field"><button class="target-star" type="button" aria-label="Catch star">✦</button></div><p class="game-stat" aria-live="polite">STARS 0 <span>·</span> TIME 15</p>');
  const target = gameContent.querySelector('.target-star');
  const field = gameContent.querySelector('.game-field');
  const stat = gameContent.querySelector('.game-stat');
  const moveTarget = () => {
    const maxX = Math.max(0, field.clientWidth - target.offsetWidth);
    const maxY = Math.max(0, field.clientHeight - target.offsetHeight);
    target.style.left = `${Math.random() * maxX}px`;
    target.style.top = `${Math.random() * maxY}px`;
  };
  target.addEventListener('click', () => {
    score += 1;
    stat.innerHTML = `STARS ${score} <span>·</span> TIME ${seconds}`;
    moveTarget();
  });
  moveTarget();
  activeTimer = setInterval(() => {
    seconds -= 1;
    stat.innerHTML = `STARS ${score} <span>·</span> TIME ${seconds}`;
    if (seconds <= 0) {
      clearInterval(activeTimer);
      target.disabled = true;
      target.hidden = true;
      stat.textContent = `SIGNAL ENDED · YOU CAUGHT ${score} STAR${score === 1 ? '' : 'S'}`;
    }
  }, 1000);
}

function startSignalLost() {
  const answer = Math.floor(Math.random() * 30) + 1;
  let guesses = 0;
  showGame('Signal Lost', '<p>A signal is hiding between 1 and 30. Can you find it?</p><form class="guess-form"><label class="visually-hidden" for="signal-guess">Your guess</label><input id="signal-guess" type="number" min="1" max="30" placeholder="1 to 30" required><button class="game-action" type="submit">Send</button></form><p class="signal-message" aria-live="polite">Awaiting your first signal.</p>');
  const form = gameContent.querySelector('.guess-form');
  const input = gameContent.querySelector('#signal-guess');
  const message = gameContent.querySelector('.signal-message');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = Number(input.value);
    if (guess < 1 || guess > 30) return;
    guesses += 1;
    if (guess === answer) {
      message.textContent = `Signal found in ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}. Nice work.`;
      form.querySelector('button').disabled = true;
      input.disabled = true;
    } else {
      message.textContent = guess < answer ? 'Too low. The signal is higher.' : 'Too high. The signal is lower.';
      input.value = '';
      input.focus();
    }
  });
  input.focus();
}

function startOrbitalDrift() {
  showGame('Orbital Drift', '<p>Wait for the signal to turn violet, then click as fast as you can.</p><button class="reaction-pad" type="button">Tap to begin</button><p class="game-stat reaction-result" aria-live="polite"></p>');
  const pad = gameContent.querySelector('.reaction-pad');
  const result = gameContent.querySelector('.reaction-result');
  let state = 'idle';
  let readyAt = 0;
  pad.addEventListener('click', () => {
    if (state === 'idle' || state === 'done') {
      state = 'waiting';
      result.textContent = '';
      pad.classList.remove('is-ready', 'is-early');
      pad.textContent = 'Wait for it...';
      activeTimer = setTimeout(() => {
        if (!dialog.open) return;
        state = 'ready';
        readyAt = performance.now();
        pad.classList.add('is-ready');
        pad.textContent = 'NOW!';
      }, 1200 + Math.random() * 2300);
      return;
    }
    if (state === 'waiting') {
      clearTimeout(activeTimer);
      state = 'done';
      pad.classList.add('is-early');
      pad.textContent = 'Too soon. Try again';
      result.textContent = 'You jumped the signal.';
      return;
    }
    if (state === 'ready') {
      state = 'done';
      const elapsed = Math.round(performance.now() - readyAt);
      pad.classList.remove('is-ready');
      pad.textContent = 'Tap to try again';
      result.textContent = `${elapsed} ms. ${elapsed < 250 ? 'Stellar reflexes.' : 'Can you beat that?'}`;
    }
  });
}

document.querySelectorAll('[data-game]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.game === 'catch') startStarCatch();
    if (button.dataset.game === 'signal') startSignalLost();
    if (button.dataset.game === 'drift') startOrbitalDrift();
  });
});

dialog.addEventListener('close', () => clearTimeout(activeTimer));