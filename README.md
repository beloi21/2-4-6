# 2-4-6 by A.R.C. Alberto

A two-player brick game for one shared phone, tablet or computer, in real-time 3D.

**Play it: https://beloi21.github.io/2-4-6/**

## How to play

Three piles hold 2, 4 and 6 bricks. On your turn:

1. Tap the bricks you want. Take as many as you like, but only from one pile. The total shows above the pile.
2. Press **Remove**, then pass the device to the other player.

Whoever takes the last brick loses, and that brick lets them know about it. Leave your opponent just one brick and they lose on the spot.

Each turn has a 30-second clock. Run out and you lose the round. The clock pauses while the rules are open or the app is in the background, and the first turn after loading waits for the first tap.

**Swap first** changes who starts, until the first brick is taken. **Surrender** (tap twice) ends the round as a loss.

Wins are tallied on the wall between rounds and the starting player swaps each round. **Reset** starts the round again and keeps the score. After a round, **Clear score** wipes the tally.

It can be added to a home screen and played offline once it has loaded.

## Running it locally

```bash
npm install
npm run dev
```

`npm test` checks the rules. `npm run build` makes the site in `dist/`. Pushing to `main` deploys to GitHub Pages.

The stone-and-glass lettering is modelled live in the browser, inspired by [Frmt_ Alphabet [Rock & Glass]](https://www.figma.com/community/file/1545706190975560906/frmt-alphabet-rock-glass) by BL/S (CC BY 4.0). None of that set's artwork is included. Letter shapes come from Archivo Black (SIL Open Font License).

Built with [Three.js](https://threejs.org/). All bricks, walls and sounds are generated in the browser. The chalk fonts are Cabin Sketch and Patrick Hand, also under the SIL Open Font License.
