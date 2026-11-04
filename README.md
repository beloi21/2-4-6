# 2-4-6 by A.R.C. Alberto

A two-player brick game for one shared phone, tablet or computer, in real-time 3D.

**Play it: https://beloi21.github.io/2-4-6/**

## How to play

Three piles hold 2, 4 and 6 bricks. On your turn:

1. Tap the bricks you want. Take as many as you like, but only from one pile. The total shows above the pile.
2. Press **Remove**, then pass the device to the other player.

Whoever takes the last brick loses, and that brick lets them know about it.

Wins are tallied on the wall between rounds and the starting player swaps each round. **Reset** starts the round again and keeps the score. After a round, **Clear score** wipes the tally.

It can be added to a home screen and played offline once it has loaded.

## Running it locally

```bash
npm install
npm run dev
```

`npm test` checks the rules. `npm run build` makes the site in `dist/`. Pushing to `main` deploys to GitHub Pages.

Built with [Three.js](https://threejs.org/). All bricks, walls and sounds are generated in the browser. Fonts are Cabin Sketch and Patrick Hand, from Google Fonts under the SIL Open Font License.
