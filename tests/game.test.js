import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRound,
  toggleBrick,
  removeSelected,
  bricksLeft,
} from '../src/game.js';

function take(round, ...ids) {
  let next = round;
  for (const id of ids) next = toggleBrick(next, id);
  return removeSelected(next);
}

test('a round starts with piles of 2, 4 and 6', () => {
  const round = createRound();
  assert.deepEqual(round.piles.map((p) => p.length), [2, 4, 6]);
  assert.equal(bricksLeft(round), 12);
});

test('tapping toggles a brick', () => {
  let round = toggleBrick(createRound(), 'p1b0');
  assert.deepEqual(round.selected, ['p1b0']);
  assert.equal(round.selectedPile, 1);
  round = toggleBrick(round, 'p1b0');
  assert.deepEqual(round.selected, []);
  assert.equal(round.selectedPile, null);
});

test('a move stays in one pile: tapping another pile moves the selection', () => {
  let round = toggleBrick(createRound(), 'p1b0');
  round = toggleBrick(round, 'p1b1');
  round = toggleBrick(round, 'p2b5');
  assert.deepEqual(round.selected, ['p2b5']);
  assert.equal(round.selectedPile, 2);
});

test('removing nothing is not a move', () => {
  const round = createRound();
  const after = removeSelected(round);
  assert.equal(after.current, 0);
  assert.equal(bricksLeft(after), 12);
});

test('removing passes the turn to the other player', () => {
  const round = take(createRound(), 'p2b0', 'p2b3', 'p2b5');
  assert.equal(bricksLeft(round), 9);
  assert.equal(round.current, 1);
  assert.equal(round.loser, null);
  assert.deepEqual(round.selected, []);
});

test('any bricks can be taken, not only from the top', () => {
  const round = take(createRound(), 'p1b1');
  assert.deepEqual(round.piles[1], ['p1b0', 'p1b2', 'p1b3']);
});

test('the player who takes the last brick loses', () => {
  let round = createRound();
  round = take(round, 'p2b0', 'p2b1', 'p2b2', 'p2b3', 'p2b4', 'p2b5'); // P1
  round = take(round, 'p1b0', 'p1b1', 'p1b2', 'p1b3'); // P2
  round = take(round, 'p0b0'); // P1
  assert.equal(round.loser, null);
  round = take(round, 'p0b1'); // P2 takes the last one
  assert.equal(round.loser, 1);
  assert.equal(bricksLeft(round), 0);
});

test('taking a whole final pile at once also loses', () => {
  let round = createRound(1);
  round = take(round, 'p2b0', 'p2b1', 'p2b2', 'p2b3', 'p2b4', 'p2b5'); // P2
  round = take(round, 'p1b0', 'p1b1', 'p1b2', 'p1b3'); // P1
  round = take(round, 'p0b0', 'p0b1'); // P2
  assert.equal(round.loser, 1);
});

test('nothing can be selected once the round is over', () => {
  let round = createRound();
  round = take(round, 'p2b0', 'p2b1', 'p2b2', 'p2b3', 'p2b4', 'p2b5');
  round = take(round, 'p1b0', 'p1b1', 'p1b2', 'p1b3');
  round = take(round, 'p0b0', 'p0b1');
  const after = toggleBrick(round, 'p0b0');
  assert.deepEqual(after.selected, []);
});
