---
name: 2-4-6 by A.R.C. Alberto
description: A dusk brickyard where fired clay bricks stand on packed ground and the score is chalked on a soot wall.
colors:
  chalk: "#efe7d8"
  ember: "#e8935a"
  ember-mark: "#ffb27c"
  ember-glow: "#ff6a20"
  fired-clay: "#a8492c"
  brick-dust: "#c9a587"
  sun-light: "#ffb078"
  sky-light: "#8496b8"
  rim-light: "#87a2d8"
  fill-light: "#ffd9c0"
  bounce-light: "#2a2018"
  goggle-white: "#fff8ec"
  pupil-ink: "#0d0a08"
  mouth-dark: "#2a0b0b"
  raspberry: "#e8607a"
  soot: "#17130f"
  packed-earth: "#4a3a2c"
  chalk-dim: "#c9bfae"
  chalk-faint: "#a79d8d"
typography:
  display:
    fontFamily: "Cabin Sketch, Patrick Hand, cursive"
    fontSize: "clamp(2.5rem, 12vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 0.95
  verdict:
    fontFamily: "Cabin Sketch, Patrick Hand, cursive"
    fontSize: "clamp(2.5rem, 12vw, 4rem)"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Cabin Sketch, Patrick Hand, cursive"
    fontSize: "clamp(1.75rem, 8vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.08
  title:
    fontFamily: "Cabin Sketch, Patrick Hand, cursive"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
  count:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.08
  label-primary:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "2.125rem"
    fontWeight: 400
    lineHeight: 1
  label-resting:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
  label-secondary:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
  name:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "1.3125rem"
    fontWeight: 400
    lineHeight: 1.2
  input:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.3
  byline:
    fontFamily: "Patrick Hand, Comic Sans MS, cursive"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  square: "0"
  brick-flat: "6px"
  drawn-tool: "8px 11px 7px 12px"
  drawn-button: "10px 14px 9px 13px"
  drawn-badge: "12px 16px 11px 15px"
spacing:
  tight: "8px"
  snug: "12px"
  gap: "16px"
  gap-wide: "24px"
components:
  button-primary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.soot}"
    typography: "{typography.label-primary}"
    rounded: "{rounded.drawn-button}"
    padding: "8px 14px"
    height: "60px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.soot}"
  button-primary-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.label-resting}"
    rounded: "{rounded.drawn-button}"
    height: "60px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.label-secondary}"
    rounded: "{rounded.drawn-button}"
    padding: "8px"
    height: "60px"
  tool-button:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.drawn-tool}"
    size: "44px"
  name-plate:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-dim}"
    typography: "{typography.name}"
    padding: "4px 8px 4px 0"
  name-plate-turn:
    textColor: "{colors.chalk}"
  count-badge:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.soot}"
    typography: "{typography.count}"
    rounded: "{rounded.drawn-badge}"
    padding: "0 12px"
  name-field:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.input}"
    rounded: "{rounded.square}"
    padding: "8px 12px"
    height: "48px"
  flat-brick:
    backgroundColor: "{colors.fired-clay}"
    rounded: "{rounded.brick-flat}"
    height: "44px"
  flat-brick-chosen:
    backgroundColor: "{colors.ember}"
---

# Design System: 2-4-6 by A.R.C. Alberto

## Overview

**Creative North Star: "The Brickyard at Dusk"**

This is a kiln yard at the end of the day, not a game interface. Fired clay bricks stand in real-time 3D on packed earth in front of a soot-blackened wall, one low warm sun rakes across them from the right, and everything that has to be read is chalked by hand. The bricks are the only things with mass; the interface is what someone scrawled nearby.

Density is low and the bricks hold most of the screen. Text sits directly on the wall with no panel behind it. The only raised surfaces in the world are physical bricks, and the only shadows are the ones the sun casts. The mood is warm, dusty and rude: heavy objects land with a thud, and when the round ends the last brick grows, sprouts mismatched goggly eyes and blows a raspberry.

The pastel, rounded casual-puzzle screen, with its cards and pill buttons, is the confirmed rejection. Materials are painted procedurally at load, so the yard itself ships no raster files.

**Key Characteristics:**
- Real-time 3D clay bricks on a dark ground, lit by a warm sun from the right and a cool dusk sky
- Hand-written chalk type on the wall, with no containers behind it
- Chalk controls that read as drawn: filled block for the primary, outline for the secondary
- Ember reserved for what is currently chosen
- Motion made of weight and gravity, placed directly under reduced motion
- A complete flat fallback in the same palette when WebGL is unavailable

## Colors

A near-black warm ground, one warm-white writing colour, baked clay, and a single hot accent; cool hues live only in the dusk light.

### Primary
- **Stick Chalk** (#efe7d8): Every line of text on the wall, every control outline and filled block, the tally marks, the turn stroke, the resting pile counts on the ground, and the default focus ring.

### Secondary
- **Ember** (#e8935a): The pile count of the chosen pile, the chosen fallback brick, the keyboard focus ring on a brick, the input caret, and selected text.
- **Hot Ember Mark** (#ffb27c): The rough chalk loop scrawled on the face of each chosen brick.
- **Ember Glow** (#ff6a20): Emissive warmth on chosen 3D bricks, at intensity 0.2 and zero otherwise.

### Tertiary
- **Fired Clay** (#a8492c): The flat reference for clay, used for fallback bricks, the flat fallback face and the app icon. The 3D bricks are a family around it: each takes a random tint (hue 14 to 22 degrees, saturation 55 to 69 percent, lightness 40 to 50 percent) over a mottled texture, and the sun renders them brighter and more orange than this swatch.
- **Brick Dust** (#c9a587): The dust puffs thrown up by landings, at 0.34 opacity.
- **Sun Light** (#ffb078), **Sky Light** (#8496b8), **Rim Light** (#87a2d8), **Fill Light** (#ffd9c0), **Bounce Light** (#2a2018): The dusk lighting rig, described under Elevation & Depth.
- **Goggle White** (#fff8ec), **Pupil Ink** (#0d0a08), **Mouth Dark** (#2a0b0b), **Raspberry** (#e8607a): The last brick's face only, in both the 3D and the flat fallback version.

### Neutral
- **Soot** (#17130f): The page, the scene background and fog, the browser and app theme colour, knocked-out text on filled chalk blocks, the legibility shade (as a fading tint), and the dialog backdrop at 0.98 opacity.
- **Packed Earth** (#4a3a2c): Base colour of the ground texture, mottled with clay and soot speckle.
- **Worn Chalk** (#c9bfae): Secondary text, including the byline, the sub-line under the turn, and the names of whichever player is not up.
- **Faint Chalk** (#a79d8d): Input placeholder text only.

### Named Rules
**The Ember Means Chosen Rule.** Ember marks the current selection and the point of action: the chosen pile, its bricks, a focused brick, the caret. It never decorates, and it never appears on a heading or a resting control.

**The Raspberry Rule.** Pink belongs to the last brick's tongue. It is the one colour outside the yard's palette, and it appears only at the moment of mockery.

## Typography

**Display Font:** Cabin Sketch (with Patrick Hand, cursive)
**Body Font:** Patrick Hand (with Comic Sans MS, cursive)

**Character:** Cabin Sketch at weight 700 is a thick, cross-hatched stick pressed hard against the wall; Patrick Hand is the quick everyday handwriting beside it. Both are self-hosted and bundled, so the fallbacks are a safety net rather than a choice.

### Hierarchy
- **Display** (700, clamp(2.5rem, 12vw, 3.5rem), 0.95): The "2-4-6" title only, always paired with the byline.
- **Verdict** (700, clamp(2.5rem, 12vw, 4rem), 1): The end-of-round line, scrawled large across the wall.
- **Headline** (700, clamp(1.75rem, 8vw, 2.5rem), 1.08): The live turn line. Balanced, and it may break anywhere so long names fit.
- **Title** (700, 2.25rem, 1): The dialog heading.
- **Count** (400, 3rem, 1.08): The running total in the badge above the chosen pile, with tabular numerals.
- **Primary Label** (400, 2.125rem, 1): The active primary control. The dialog's confirm uses a near match at 2rem.
- **Resting Label** (400, 1.75rem, 1): The primary control while it is disabled and prompting.
- **Secondary Label** (400, 1.5rem, 1): The outline control.
- **Name** (400, 1.3125rem, 1.2): Player names on the wall, rising to 1.5rem on wider screens and truncating with an ellipsis.
- **Input** (400, 1.375rem, 1.3): Typed names in the dialog.
- **Body** (400, 18px, 1.3): The base size, also used for the sub-line and field labels at 1.125rem and dialog paragraphs at 1.1875rem.
- **Byline** (400, 1.0625rem, 1.2): "by A.R.C. Alberto", never wrapped.

The pile counts on the ground and the maker's mark on the bricks are type too: Patrick Hand painted into a ground texture with grains rubbed out, and "A.R.C." in Cabin Sketch stamped into the brick's frog.

### Named Rules
**The Heavy Stick Rule.** Cabin Sketch is for the title, the turn line, the verdict and the dialog heading. Everything anyone presses, counts or reads at length is Patrick Hand.

**The Plain Hand Rule.** Hierarchy comes from size and the two hands alone. There is no uppercase styling, tracking, or added weight anywhere in the system.

### Stone-and-Glass Lettering

The title, byline, ground counts and the lose-screen LOSER are live 3D glyphs (src/glyphs.js): Archivo Black shapes fractured down the middle into rough stone (left) and blue glass #1f6fff (right), with lightning in the break on larger words. Lightning flickers on moves, new rounds and the loss, and rests faint in between. A chosen pile's count glows ember. Everything else stays chalk. The style is inspired by Frmt_ Alphabet [Rock & Glass] by BL/S (CC BY 4.0), credited in the rules screen and README; none of its artwork ships.

## Layout

The screen is a full-bleed fixed stage with no scrolling. The 3D canvas fills the viewport, and chalk overlays sit on it in a centred column up to 720px wide: title, names, tallies and turn line against the top, controls against the bottom. The camera then fits the three stacks into the space those overlays leave, and slides the picture down to stand just above the controls when there is height to spare.

Piles stand left to right as 2, 4, 6, with their remaining counts chalked on the ground in front of each. Transparent tap targets are re-projected over the 3D bricks every frame, so the thing you see is the thing you press.

The rhythm is 16px at the screen edge, 24px on wider screens, 8px between the score columns and tools, and 12px between the control pair. The control pair splits 1:2 with the primary on the right. Touch targets are at least 44px, and the main controls 60px. Safe-area insets are respected at the top and bottom, and at the left on short landscape.

Short landscape screens (height 560px or less) move the chalk into a 38 percent column on the left, beside the stacks, split the controls 1:1.5, and shrink the type; the turn line and verdict both drop to 1.5rem there. Wide screens only add side padding and larger names.

## Elevation & Depth

Depth is physical. The DOM has no box-shadows, no text-shadows and no backdrop blur: chalk lies flat on the wall. All elevation is real geometry in a lit 3D scene, with soft shadow maps, filmic tone mapping at 1.08 exposure, and fog in soot colour that follows the camera so a far-back phone view is not dimmer than a desktop one.

The lighting rig is the system's most defining element, and every 3D addition lives inside it. **Sun Light** is a directional shadow-casting light at intensity 5.2, positioned low and to the right (x 7, y 2.7, z 3.5). **Sky Light** over **Bounce Light** forms a hemisphere at 1.5. **Rim Light** comes from behind on the left at 0.85. **Fill Light** comes from the viewer at 0.75, keeping shadowed brick faces readable. The back wall skips tone mapping and glows faintly from its own map at 0.62, so its courses survive inside a shadow.

The one DOM depth device is the legibility shade: a soot tint fading to nothing across the top 42 percent of the screen (0.82 opacity at its strongest), or from the left edge on short landscape (0.86 opacity). It exists so chalk stays readable whatever the sun does.

### Named Rules
**The Right-Hand Sun Rule.** The sun is always on the right, so shadows always fall to the left. The tallest stack stands on the right, which throws its shadow across the shorter ones and along the ground. Nothing in the yard gets a second shadow-casting light.

**The Only Shadows Rule.** A shadow in this world is cast by the sun onto something. If an element is not a 3D object, it does not get a shadow.

## Shapes

Two families, and they never mix. Bricks are true solids with crisp, barely eased arrises (1.16 by 0.5 by 0.56 world units with a 0.032 edge radius), slightly jittered in position and rotation so a stack never looks machined.

Chalk is drawn. Its corners are deliberately unequal on all four sides, so no two read the same, and filled blocks and outlines pass through turbulence filters that wobble the edge and break up the grain. Filled blocks show horizontal streaks where the stick thinned out. The title, turn line and tallies carry a finer displacement of their own, and tally marks wobble stroke by stroke, with a slash through every fifth.

Functional lines stay plainer. The field underline is square-ended and unfiltered, and the turn stroke is a thin 3px mark tilted by 0.7 degrees.

## Components

### Buttons
Chalk marks you press, with no bevels or surfaces.
- **Shape:** Hand-drawn unequal corners (10px 14px 9px 13px), 60px tall.
- **Primary:** A filled chalk block with soot knockout text, its streaked texture coming from the solid chalk filter. It always holds the right-hand, larger position.
- **Hover / Focus:** On pointer devices the block brightens to pure white. Focus is a 3px dashed chalk ring, 3px out. Press scales to 0.97 over 110ms.
- **Disabled:** The block empties into a dashed worn-chalk outline with chalk text at the smaller resting size, and its label prompts the next step.
- **Secondary:** A 3px chalk outline with a grainy broken line and chalk text. Hover lays a 14 percent chalk wash into the outline.

### Tool Buttons
Small drawn squares for sound and rules.
- **Shape:** 44px square, 2.5px gritty chalk outline, corners 8px 11px 7px 12px.
- **Icons:** Inline stroked SVG at 22px, 2px line with round caps, in current colour. Sound swaps between its on and off states.
- **States:** The same chalk wash on hover as the secondary button; press scales to 0.94 over 120ms.

### Inputs / Fields
A line you write above, nothing more.
- **Style:** Transparent, a 3px chalk underline with square ends, 48px tall, with an ember caret and Faint Chalk placeholder.
- **Focus:** A 2px dashed chalk ring, 2px out.
- **Labels:** Always visible, above the line, at 1.125rem.

### Dialog
The wall itself with the game rubbed out, never a card.
- **Style:** Transparent body, chalk text, no border or radius, up to 440px wide, over a soot backdrop at 0.98 opacity.
- **Confirm:** A full-width filled chalk block.

### Name Plate and Tally
The score, chalked on the wall.
- **Style:** A borderless button holding the name and its tally. There is no container and no background.
- **Turn:** A chalk stroke draws in under the name over 260ms as the name brightens from worn chalk to full chalk.
- **Tally:** Strokes in 2.8px round-capped chalk, grouped in fives, switching to a written number above 25.
- **Hover:** The name brightens and takes a dashed underline, offering a rename.

### Count Badge
A filled chalk tag above the chosen pile.
- **Style:** Soot numeral knocked out of a solid chalk block, corners 12px 16px 11px 15px, at least 56px wide.
- **Behaviour:** Flips over 240ms when the number changes, and stays clear of the chalk text on short screens.

### Fired Brick
The thing you touch, and the world's signature.
- **Material:** Procedural clay with firing blotches, sand speckle and mould drag marks, plus a recessed stamped frog bearing "A.R.C." in the bump and colour maps.
- **Chosen:** Slides 0.34 units towards the viewer, warms with Ember Glow, and gains the Hot Ember Mark loop on its face; the pile's ground count turns ember.
- **Removed:** Hurled tumbling off the side of the screen. Bricks above fall under gravity of 15 units per second squared, rebound at a fifth of their impact speed, thud, puff dust and nudge the camera.
- **Keyboard:** A 3px solid ember ring, 1px out, on the transparent target tracking the brick.

### Last Brick
The loser's punishment.
- **Behaviour:** Grows to 2.75 times its size over 620ms in an arc to centre stage, lands with a big thud and dust, then hops and sways while the face plays.
- **Face:** Mismatched goggly eyes, tilted brows, one buck tooth and a wagging raspberry tongue. The pile counts leave the ground while it performs.

### Flat Brick
The no-WebGL fallback, so the game still plays.
- **Style:** Fired Clay with a 2px chalk border and 6px corners, stacked in flex columns. The last brick's face becomes a flat SVG in the same colours.
- **Chosen:** Ember fill with a 3px dashed chalk ring, 2px out, so selection never rests on colour alone.

### Turn Clock and Round Controls

A chalk ring beside the turn text wears away over 30 seconds, with the seconds inside. It turns ember at 10 seconds and beats at 5. Reset, Surrender and Swap first share a slim row above the primary button; Swap first leaves after the first move, and Surrender asks "Really?" before it counts. When the round ends, the row collapses back to Clear score beside Play again so the last brick keeps the stage.

## Do's and Don'ts

### Do:
- **Do** write text straight onto the wall in chalk, or knock it out in soot from a filled chalk block.
- **Do** keep the primary as a filled chalk block and the secondary as a chalk outline, with drawn unequal corners (see the `rounded` tokens).
- **Do** run drawn blocks and outlines through the chalk filters, so they read as made by hand.
- **Do** place every new 3D object inside the existing lighting rig, with the sun on the right.
- **Do** make everything that falls land with weight: gravity, a thud, dust. Under reduced motion, place it directly and skip the dust, bounce and shake.
- **Do** signal selection and turn in at least two ways, such as a stroke, a mark, a position change or a dashed ring alongside any colour change.
- **Do** paint new yard materials procedurally onto canvas, in keeping with the clay, wall and ground textures.
- **Do** keep the name reading "2-4-6 by A.R.C. Alberto", and keep the bricks 3D wherever WebGL exists.

### Don't:
- **Don't** put text or controls on a card, panel, or any raised container.
- **Don't** use pill shapes or uniform rounded corners on drawn chalk controls.
- **Don't** fill a control, block or panel with a gradient. Gradients in this world are limited to the soot legibility shade and to painting texture and dust inside the yard's materials.
- **Don't** use glass, backdrop blur, or a CSS shadow on anything.
- **Don't** move the sun to the left or add a second shadow-casting light.
- **Don't** use ember for headings, resting controls, or decoration.
- **Don't** use the raspberry pink anywhere but the last brick's face.
- **Don't** set Cabin Sketch on buttons, labels, or body copy.
- **Don't** add uppercase styling or letter-spacing.
