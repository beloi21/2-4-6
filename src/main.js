import '@fontsource/cabin-sketch/700.css';
import '@fontsource/patrick-hand/400.css';
import './style.css';
import { createRound, toggleBrick, removeSelected, forfeit, canSwapStarter, swapStarter } from './game.js';
import { createScene } from './scene.js';
import { createSound } from './sound.js';

const STORE_KEY = '2-4-6';
const DEFAULT_NAMES = ['Player 1', 'Player 2'];
const TURN_MS = 30000;
const LAST_BRICK_PAUSE_MS = 700; // A beat to see the throw before the last brick pounces.
const $ = (id) => document.getElementById(id);

function load() {
  const base = { names: [...DEFAULT_NAMES], wins: [0, 0], starter: 0, sound: true };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return { ...base, ...saved };
  } catch {
    return base;
  }
}
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* Private windows may refuse storage; the game still plays. */
  }
}

const store = load();
let round = createRound(store.starter);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound = createSound(store.sound);
const name = (player) => store.names[player] || DEFAULT_NAMES[player];

/* ------- DOM ------- */

const ui = {
  piles: $('piles'),
  turn: $('turn'),
  sub: $('turn-sub'),
  primary: $('primary'),
  secondary: $('secondary'),
  surrender: $('surrender'),
  swap: $('swap'),
  clock: $('clock'),
  clockNum: $('clock-num'),
  clockRing: $('clock-ring'),
  badge: $('badge'),
  badgeNum: $('badge-num'),
  status: $('status'),
  plates: [$('plate-0'), $('plate-1')],
  names: [$('name-0'), $('name-1')],
  tallies: [$('tally-0'), $('tally-1')],
  dialog: $('setup'),
  inputs: [$('input-0'), $('input-1')],
  soundBtn: $('sound'),
  face: $('flat-face'),
};
const buttons = new Map();

function buildBrickButtons() {
  ui.piles.textContent = '';
  buttons.clear();
  round.piles.forEach((pile, p) => {
    const group = document.createElement('div');
    group.className = 'pile';
    group.setAttribute('role', 'group');
    group.dataset.pile = String(p);
    pile.forEach((id, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'brick';
      button.dataset.id = id;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => tapBrick(id));
      group.append(button);
      buttons.set(id, button);
    });
    ui.piles.append(group);
  });
}

/** Tally marks: four strokes and a slash, hand-wobbled but stable per mark. */
function tallyMarks(count) {
  if (count > 25) return `<text x="0" y="23" class="tally-number">${count}</text>`;
  let path = '';
  let x = 2;
  const wobble = (n) => ((n * 7919) % 5) * 0.5 - 1;
  for (let i = 1; i <= count; i++) {
    if (i % 5 === 0) {
      path += `M${x - 37} ${22 + wobble(i)}L${x - 3} ${5 + wobble(i + 1)}`;
      x += 8;
    } else {
      path += `M${x + wobble(i)} ${3 + wobble(i + 2)}L${x + wobble(i + 3)} ${25 + wobble(i + 1)}`;
      x += 9;
    }
  }
  return `<path d="${path}" />`;
}

function renderScore() {
  store.wins.forEach((wins, p) => {
    ui.names[p].textContent = name(p);
    const width = Math.max(40, Math.ceil(wins / 5) * 44 + 8);
    ui.tallies[p].setAttribute('viewBox', `0 0 ${width} 28`);
    ui.tallies[p].style.width = `${width}px`;
    ui.tallies[p].setAttribute('preserveAspectRatio', 'xMinYMid meet');
    ui.tallies[p].innerHTML = tallyMarks(wins);
    ui.plates[p].setAttribute(
      'aria-label',
      `${name(p)}, ${wins} ${wins === 1 ? 'win' : 'wins'}. Change names`,
    );
  });
}

function setPrimary(label, disabled) {
  ui.primary.textContent = label;
  ui.primary.disabled = disabled;
}

let confirmingClear = 0;
let confirmingSurrender = 0;
let pounce = 0;

const VERDICTS = {
  last: (loser) => `${loser} took the last brick!`,
  forced: (loser) => `${loser} is stuck with the last brick!`,
  surrender: (loser) => `${loser} surrendered!`,
  timeout: (loser) => `${loser} ran out of time!`,
};

function render() {
  const over = round.loser !== null;
  const who = name(round.current);
  const count = round.selected.length;

  ui.plates.forEach((plate, p) =>
    plate.classList.toggle('is-turn', !over && p === round.current),
  );

  if (over) {
    const loser = name(round.loser);
    const winner = name(1 - round.loser);
    ui.turn.textContent = VERDICTS[round.reason](loser);
    ui.sub.textContent = `${winner} wins.`;
    setPrimary('Play again', false);
    ui.secondary.textContent = 'Clear score';
  } else {
    ui.turn.textContent = count ? `${who} takes ${count}` : `${who}, your turn`;
    ui.sub.textContent = count
      ? 'Tap more from this pile, or remove.'
      : 'Take from one pile. Last brick loses.';
    setPrimary(count ? `Remove ${count}` : 'Tap a brick', count === 0);
    ui.secondary.textContent = 'Reset';
    ui.surrender.setAttribute('aria-label', `${who} surrenders`);
    ui.swap.setAttribute('aria-label', `Swap first move to ${name(1 - round.current)}`);
  }
  confirmingClear = 0;
  ui.surrender.hidden = over;
  ui.swap.hidden = !canSwapStarter(round);

  for (const [id, button] of buttons) {
    const pile = round.piles.findIndex((list) => list.includes(id));
    const alive = pile !== -1;
    button.hidden = !alive || over;
    if (!alive) continue;
    button.setAttribute('aria-pressed', String(round.selected.includes(id)));
    const left = round.piles[pile].length;
    const position = round.piles[pile].indexOf(id) + 1;
    button.setAttribute('aria-label', `Brick ${position} of ${left} in pile ${pile + 1}`);
  }

  ui.piles.querySelectorAll('.pile').forEach((group, p) => {
    group.setAttribute('aria-label', `Pile ${p + 1}, ${round.piles[p].length} bricks`);
    group.classList.toggle('is-chosen', round.selectedPile === p);
  });

  placeBadge();
  stage?.wake();
}

function placeBadge() {
  const count = round.selected.length;
  if (!count) {
    ui.badge.hidden = true;
    return;
  }
  ui.badge.hidden = false;
  if (ui.badgeNum.textContent !== String(count)) {
    ui.badgeNum.textContent = String(count);
    ui.badgeNum.classList.remove('flip');
    void ui.badgeNum.offsetWidth;
    ui.badgeNum.classList.add('flip');
  }
  if (stage) {
    const top = stage.pileTop(round.selectedPile, round.piles[round.selectedPile].length);
    // Never over the chalk text: on short screens it sits on the top brick instead.
    let y = Math.max(top.y, freeArea().y + ui.badge.offsetHeight + 4);
    // Nor over the name on the wall: it drops onto the top brick if it must.
    const name = stage.nameRect();
    const half = ui.badge.offsetWidth / 2;
    if (name && top.x - half < name.right + 4 && top.x + half > name.left - 4 && y - ui.badge.offsetHeight < name.bottom + 4) {
      y = name.bottom + 4 + ui.badge.offsetHeight;
    }
    ui.badge.style.transform = `translate(${top.x}px, ${y}px) translate(-50%, -100%)`;
  }
}

function placeTargets() {
  if (!stage) return;
  for (const [id, button] of buttons) {
    if (button.hidden) continue;
    const rect = stage.brickRect(id);
    if (!rect) continue;
    button.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
    button.style.width = `${rect.w}px`;
    button.style.height = `${rect.h}px`;
  }
}

function announce(text) {
  ui.status.textContent = text;
}

/* ------- Moves ------- */

function tapBrick(id) {
  if (round.loser !== null) return;
  round = toggleBrick(round, id);
  sound.tick();
  stage?.setSelected(round.selected);
  render();
  const count = round.selected.length;
  announce(
    count
      ? `${name(round.current)} is taking ${count} from pile ${round.selectedPile + 1}.`
      : 'Nothing selected.',
  );
}

function remove() {
  if (round.selected.length === 0) return;
  const taken = [...round.selected];
  const pile = round.selectedPile;
  const mover = round.current;
  round = removeSelected(round);
  sound.whoosh();
  try {
    navigator.vibrate?.(18);
  } catch {
    /* Vibration is a bonus. */
  }

  stage?.setSelected([]);
  if (round.reason === 'last') {
    stage?.removeBricks(taken, taken[taken.length - 1]);
  } else {
    stage?.removeBricks(taken);
  }
  stage?.setPileCount(pile, round.piles[pile].length);

  if (round.loser === null) {
    resetSurrender();
    startClock();
    render();
    announce(`${name(mover)} removed ${taken.length}. ${round.piles.map((p) => p.length).join(', ')} left. ${name(round.current)}'s turn.`);
    ui.primary.blur();
    return;
  }

  if (round.reason === 'forced') {
    const lastBrick = round.piles.flat()[0];
    pounce = window.setTimeout(() => stage?.removeBricks([], lastBrick), LAST_BRICK_PAUSE_MS);
  }
  finishRound();
  announce(
    round.reason === 'last'
      ? `${name(round.loser)} took the last brick and loses. ${name(1 - round.loser)} wins.`
      : `One brick left. ${name(round.loser)} is stuck with it and loses. ${name(1 - round.loser)} wins.`,
  );
}

/** The player to move loses now: the yard clears and one brick stays to mock them. */
function giveUp(reason) {
  const standing = round.piles.flat();
  const tallest = round.piles.reduce((a, b) => (b.length > a.length ? b : a));
  round = forfeit(round, reason);
  sound.whoosh();
  stage?.setSelected([]);
  stage?.removeBricks(standing, tallest[tallest.length - 1]);
  round.piles.forEach((_, p) => stage?.setPileCount(p, 0));
  finishRound();
  const loser = name(round.loser);
  const winner = name(1 - round.loser);
  announce(reason === 'timeout' ? `${loser} ran out of time and loses. ${winner} wins.` : `${loser} surrendered. ${winner} wins.`);
}

function finishRound() {
  store.wins[1 - round.loser] += 1;
  store.starter = 1 - round.starter;
  save();
  renderScore();
  resetSurrender();
  document.body.classList.add('is-over');
  if (!stage) ui.face.removeAttribute('hidden');
  render();
  relayout();
}

function startRound() {
  window.clearTimeout(pounce);
  round = createRound(store.starter);
  document.body.classList.remove('is-over');
  ui.face.setAttribute('hidden', '');
  buildBrickButtons();
  stage?.newRound(round.piles);
  resetSurrender();
  startClock();
  render();
  relayout();
  announce(`New round. ${name(round.current)} goes first.`);
}

function swapFirst() {
  round = swapStarter(round);
  store.starter = round.starter;
  save();
  sound.tick();
  stage?.setSelected(round.selected);
  resetSurrender();
  startClock();
  render();
  announce(`${name(round.current)} goes first.`);
}

/* ------- Turn clock ------- */

let timeLeft = TURN_MS;
let lastTick = performance.now();
let shownSeconds = null;
// Nobody should lose to a page they haven't touched yet: the first turn's clock
// waits for the first tap or key after loading.
let clockArmed = false;

function startClock() {
  timeLeft = TURN_MS;
  shownSeconds = null;
  renderClock();
}

function renderClock() {
  ui.clockRing.style.strokeDashoffset = String(1 - Math.max(0, timeLeft) / TURN_MS);
  const seconds = Math.max(0, Math.ceil(timeLeft / 1000));
  if (seconds === shownSeconds) return;
  const counting = shownSeconds !== null;
  shownSeconds = seconds;
  ui.clockNum.textContent = String(seconds);
  ui.clock.classList.toggle('is-low', seconds <= 10);
  ui.clock.classList.toggle('is-critical', seconds <= 5);
  if (!counting) return;
  if (seconds > 0 && seconds <= 5) sound.tick();
  if (seconds === 10 || seconds === 5) announce(`${name(round.current)}, ${seconds} seconds left.`);
}

function tickClock() {
  const now = performance.now();
  // Capped, so a stalled or sleeping device doesn't eat a player's turn.
  const elapsed = Math.min(1000, now - lastTick);
  lastTick = now;
  if (!clockArmed || round.loser !== null || document.hidden || ui.dialog.open) return;
  timeLeft -= elapsed;
  renderClock();
  if (timeLeft <= 0) giveUp('timeout');
}

const armClock = () => {
  clockArmed = true;
};
for (const type of ['pointerdown', 'keydown', 'click']) {
  document.addEventListener(type, armClock, { capture: true });
}
window.setInterval(tickClock, 250);

function clearScore() {
  store.wins = [0, 0];
  save();
  renderScore();
  announce('Score cleared.');
}

/* ------- Controls ------- */

ui.primary.addEventListener('click', () => {
  if (round.loser !== null) startRound();
  else remove();
});

ui.secondary.addEventListener('click', () => {
  if (round.loser === null) {
    startRound();
    return;
  }
  // Clearing a long-running score takes a second tap.
  if (!confirmingClear) {
    ui.secondary.textContent = 'Really clear?';
    confirmingClear = window.setTimeout(() => {
      confirmingClear = 0;
      ui.secondary.textContent = 'Clear score';
    }, 3000);
    return;
  }
  window.clearTimeout(confirmingClear);
  confirmingClear = 0;
  ui.secondary.textContent = 'Clear score';
  clearScore();
});

function resetSurrender() {
  window.clearTimeout(confirmingSurrender);
  confirmingSurrender = 0;
  ui.surrender.textContent = 'Surrender';
  ui.surrender.classList.remove('is-confirming');
}

// Losing the round on a stray tap would sting, so it takes a second one.
ui.surrender.addEventListener('click', () => {
  if (round.loser !== null) return;
  if (!confirmingSurrender) {
    ui.surrender.textContent = 'Really?';
    ui.surrender.classList.add('is-confirming');
    confirmingSurrender = window.setTimeout(resetSurrender, 3000);
    return;
  }
  giveUp('surrender');
});

ui.swap.addEventListener('click', swapFirst);

function openSetup() {
  ui.inputs.forEach((input, p) => {
    input.value = store.names[p] === DEFAULT_NAMES[p] ? '' : store.names[p];
  });
  ui.dialog.showModal();
}

$('setup-form').addEventListener('submit', () => {
  ui.inputs.forEach((input, p) => {
    store.names[p] = input.value.trim() || DEFAULT_NAMES[p];
  });
  save();
  renderScore();
  render();
});
ui.plates.forEach((plate) => plate.addEventListener('click', openSetup));
$('help').addEventListener('click', openSetup);

function renderSoundButton() {
  ui.soundBtn.setAttribute('aria-pressed', String(sound.on));
  ui.soundBtn.classList.toggle('is-off', !sound.on);
}
ui.soundBtn.addEventListener('click', () => {
  sound.set(!sound.on);
  store.sound = sound.on;
  save();
  renderSoundButton();
  sound.tick();
});

/* ------- Stage ------- */

let stage = null;
try {
  stage = createScene($('yard'), {
    reducedMotion,
    onThud: (s) => sound.thud(s),
    onTongue: () => sound.raspberry(),
    onStrike: () => sound.crack(),
    onFrame: () => {
      placeTargets();
      placeBadge();
    },
  });
} catch (error) {
  // No WebGL: bricks fall back to flat chalk-outlined buttons and the game still works.
  console.warn('2-4-6: WebGL unavailable, using flat bricks.', error);
  document.body.classList.add('no-3d');
}

function freeArea() {
  const header = document.querySelector('.top').getBoundingClientRect();
  const footer = document.querySelector('.controls').getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (window.matchMedia('(orientation: landscape) and (max-height: 560px)').matches) {
    return { x: header.right, y: 8, w: w - header.right - 8, h: h - 16 };
  }
  return { x: 8, y: header.bottom, w: w - 16, h: Math.max(80, footer.top - header.bottom) };
}

let resizeFrame = 0;
function relayout() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => stage?.layout(freeArea()));
}
window.addEventListener('resize', relayout);
window.addEventListener('orientationchange', relayout);

async function boot() {
  // The canvas textures paint with the chalk face, so it has to be ready first.
  try {
    await Promise.all([
      document.fonts.load('700 100px "Cabin Sketch"'),
      document.fonts.load('400 20px "Patrick Hand"'),
    ]);
  } catch {
    /* Fall back to whatever face is available. */
  }
  renderScore();
  renderSoundButton();
  buildBrickButtons();
  stage?.layout(freeArea());
  stage?.newRound(round.piles);
  render();
  document.body.classList.add('is-ready');
}
boot();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js');
      const ready = await navigator.serviceWorker.ready;
      // Files fetched before the worker took over still need to land in its cache.
      const urls = performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => url.startsWith(location.origin));
      // The install files too, so adding to a home screen works offline.
      for (const file of ['manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png']) {
        urls.push(new URL(file, location.href).href);
      }
      ready.active?.postMessage({ type: 'cache', urls });
    } catch {
      /* Offline play is a bonus; the game still works online. */
    }
  });
}
