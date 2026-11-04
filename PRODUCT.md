# 2-4-6 by A.R.C. Alberto

## Product
A two-player pass-and-play strategy game for one shared device (misère Nim).
Three piles hold 2, 4 and 6 bricks. On a turn a player removes any number of bricks, at least one, from a single pile. Whoever takes the last brick loses.

## Users and scene
Two people sharing a phone, tablet or laptop, passing it back and forth, usually in a casual moment with friends or family. Rounds last about a minute. They play several rounds in a row and tease whoever loses.

## Flow (confirmed by the author)
1. Players may enter names, or keep Player 1 and Player 2.
2. The current player taps bricks one at a time; a tap toggles a brick and the running total is shown.
3. Tapping a brick in another pile moves the selection to that pile, which enforces the one-pile rule.
4. The player presses Remove, then play passes to the next player.
5. The loser gets a silly face animation.
6. Wins are tallied across rounds. Reset starts a new round; clearing the score is a separate action.

## Platform
web. Phone-first, also desktop. Installable and playable offline.

## Stack
Author chose real-time 3D rendered with Three.js, a public GitHub repo, and GitHub Pages hosting. Other implementation choices delegated.

## Brand commitments
- Name always reads "2-4-6 by A.R.C. Alberto".
- Bricks are 3D and are the thing you touch.

## Accessibility
Every move must also work by keyboard and be announced to screen readers. Respect reduced motion. Win/lose and selection never rely on color alone.
