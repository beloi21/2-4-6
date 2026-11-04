// Pure rules for 2-4-6. No DOM, no rendering, so the tests can run in plain Node.

export const PILE_SIZES = [2, 4, 6];

export function createRound(starter = 0) {
  return {
    // Each pile lists its bricks bottom to top.
    piles: PILE_SIZES.map((size, p) =>
      Array.from({ length: size }, (_, b) => `p${p}b${b}`),
    ),
    current: starter,
    starter,
    selectedPile: null,
    selected: [],
    loser: null,
  };
}

export function pileOf(round, brickId) {
  return round.piles.findIndex((pile) => pile.includes(brickId));
}

/**
 * Tap a brick. Tapping toggles it. Tapping a brick in another pile moves the
 * selection there, which is what keeps a move to one pile.
 */
export function toggleBrick(round, brickId) {
  if (round.loser !== null) return round;
  const pile = pileOf(round, brickId);
  if (pile === -1) return round;

  if (round.selectedPile !== pile) {
    return { ...round, selectedPile: pile, selected: [brickId] };
  }
  const selected = round.selected.includes(brickId)
    ? round.selected.filter((id) => id !== brickId)
    : [...round.selected, brickId];
  return {
    ...round,
    selected,
    selectedPile: selected.length ? pile : null,
  };
}

export function clearSelection(round) {
  return { ...round, selected: [], selectedPile: null };
}

/** Remove the selected bricks. Whoever empties the yard loses. */
export function removeSelected(round) {
  if (round.loser !== null || round.selected.length === 0) return round;
  const piles = round.piles.map((pile, p) =>
    p === round.selectedPile
      ? pile.filter((id) => !round.selected.includes(id))
      : pile,
  );
  const empty = piles.every((pile) => pile.length === 0);
  return {
    ...round,
    piles,
    selected: [],
    selectedPile: null,
    loser: empty ? round.current : null,
    current: empty ? round.current : 1 - round.current,
  };
}

export function bricksLeft(round) {
  return round.piles.reduce((sum, pile) => sum + pile.length, 0);
}
