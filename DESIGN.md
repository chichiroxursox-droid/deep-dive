---
name: Deep Dive
description: A kid looks out of a sub's porthole at the research station where each lab teaches how chatbots work.
colors:
  abyss: "#04182b"
  deep: "#0a2a45"
  panel: "#0f3657"
  line: "#1d5580"
  sand: "#fff4e0"
  coral: "#ff7a59"
  coral-light: "#ff9577"
  glow: "#5ef2e6"
  brass: "#e8b04a"
  sun: "#ffd166"
  kelp: "#7ddc8a"
  urchin: "#ff7aa0"
  sea-top: "#2b8fbc"
  sea-mid: "#0d527a"
typography:
  display:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "clamp(3.75rem, 9vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.2
  title:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.33
  subtitle:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  body-large:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.56
  body:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
  token:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  bubble: "1.25rem"
  3xl: "1.5rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.75rem"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.abyss}"
    rounded: "{rounded.xl}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.coral-light}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.sand}"
    rounded: "{rounded.xl}"
    padding: "0.5rem 1rem"
  button-hatch-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.abyss}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.xl}"
    padding: "1rem 1.75rem"
  button-hatch-ghost:
    backgroundColor: "{colors.abyss}"
    textColor: "{colors.sand}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.xl}"
    padding: "1rem 1.75rem"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.sand}"
    rounded: "{rounded.lg}"
    padding: "0.25rem 0.75rem"
  chip-pressed:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.abyss}"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.sand}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.lg}"
  well:
    backgroundColor: "{colors.abyss}"
    textColor: "{colors.sand}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  goal-callout:
    backgroundColor: "{colors.abyss}"
    textColor: "{colors.sand}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.abyss}"
    textColor: "{colors.sand}"
    rounded: "{rounded.xl}"
    padding: "0.5rem 0.75rem"
  dialog:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.sand}"
    rounded: "{rounded.3xl}"
    padding: "{spacing.xl}"
  lab-badge:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.abyss}"
    rounded: "{rounded.full}"
    size: "3rem"
  pip-bubble:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.abyss}"
    rounded: "{rounded.bubble}"
    padding: "0.7rem 1rem"
  plaque:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.sand}"
    rounded: "{rounded.2xl}"
    padding: "1.25rem 1.5rem"
  keycap:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.sand}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.5rem"
  porthole:
    backgroundColor: "{colors.brass}"
    rounded: "{rounded.full}"
    padding: "7%"
  mini-porthole:
    backgroundColor: "{colors.sea-mid}"
    rounded: "{rounded.full}"
    size: "2.75rem"
---

# Design System: Deep Dive

## Overview

**Creative North Star: "The Sub's Porthole"**

Every screen is the inside of a small research sub parked at the bottom of the sea. The walls are deep navy hull plates, riveted along one seam every 150px. The thing you look at is a brass-rimmed porthole with twelve bolts, and through the glass is the lit station you are about to walk into. The palette, the heavy type and Pip (the small aqua robot guide) are the same on the start screen, the loading screen, Map mode, the lab overlays and the canvas-painted signs inside the 3D station, so a kid never feels they left the game to read a menu.

The world is dark, warm-lit and chunky. Text is warm sand on navy, never white on black. Controls are coral and feel like physical hatches: a heavy bottom edge that sinks 3px when pressed. Aqua belongs to Pip and to whatever Pip is pointing at, including the keyboard focus ring. Depth comes from three stacked navy tones, and real shadows are saved for the objects that are bolted into the sub (the porthole, the plaque, Pip's speech bubble, the hatch buttons). All scene art is inline SVG and CSS gradients; nothing is downloaded, because Chromebooks on school Wi-Fi are the home audience and Map mode must stay tiny.

The water keeps moving while a kid decides: kelp sways, bubbles rise, a small fish school swims past, the station beacon blinks, Pip bobs and waves. On the loading screen the porthole "sinks": bubbles rush up and the station rises 110px into view over 6s. Every one of these stops under `prefers-reduced-motion`. The world must never read as babyish (made for 6 year olds) or as a corporate AI startup landing page.

**Key Characteristics:**
- Riveted navy hull (abyss, deep, panel) as the ground of every full-screen surface.
- Brass porthole with 12 bolts as the signature frame; a 2.75rem mini porthole as the in-lab loader.
- Coral for anything you press; aqua for Pip, focus and the payoff; kelp for right, urchin for wrong.
- Heavy type (900 headings, 700 controls) in the game's own font stack, rounded where the device has a rounded system face.
- Pressable things have a thick bottom edge (5px hatches, 4px keycaps).
- Inline SVG and CSS only; no image or font downloads.

## Colors

A cold, deep navy hull lit by a few warm, saturated signal colors, with brass as the one metal.

### Primary
- **Hatch Coral** (coral): the color of pressing and picking. Primary buttons and hatches, pressed chips, the numbered lab badges in Map mode, the range slider accent and its value, the kid's own word in the odds bars, the border of a lab's goal callout, the lesson's rule line under its title, and the score on the license. Abyss text on coral measures 7.0:1.
- **Warm Coral** (coral-light): the primary button's hover state only.

### Secondary
- **Pip Aqua** (glow): Pip's body, the border and tail of Pip's speech bubble, the 3px focus ring, small counter labels ("Round 1 of 4"), Map mode headings, the safety line on the plaque, and the border of the result card that closes each lab. 9.1:1 on panel.

### Tertiary
- **Porthole Brass** (brass): metal fittings only. The porthole rim (a conic gradient between #b8862f and #fff0c2 centered on this brass), the mini porthole's 4px ring, and the trim on the station's airlock sign.
- **Sun Yellow** (sun): the third color of the token rainbow, the fish school, and Pip's antenna. Used as a literal value; it is not in the `@theme` block.
- **Kelp Green** (kelp): right answers, "Done" marks, the "license complete" line, a context bar that still has room. 7.4:1 on panel.
- **Urchin Pink** (urchin): wrong answers, "think again", a context bar over 85% full. 5.1:1 on panel.
- **Shallow Water** (sea-top) and **Mid Water** (sea-mid): the view through the glass. They are the top two stops of the porthole scene's water gradient and the whole fill of the mini porthole.

### Neutral
- **Abyss** (abyss): page background, the darkest hull tone, input and well fills, text on coral, glow and sand surfaces. Also the browser `theme-color`.
- **Deep Hull** (deep): the hull plates and the lab dialog surface.
- **Panel** (panel): cards, the plaque, keycaps; the lit center of the hull's radial gradient.
- **Seam Line** (line): 2px borders on ghost buttons, chips, inputs, keycaps and resting Map rows.
- **Sand** (sand): all body text on navy, and the fill of Pip's speech bubble. Secondary text is sand at 80 to 90% opacity, tertiary at 60 to 70%. 16.5:1 on abyss.

### Named Rules
**The Coral Is the Kid's Hand Rule.** In interface chrome, coral marks what a kid presses, what the kid picked (their guess in the odds bars, the slider's value), the one rule a lab teaches, and their score on the license. Never use it for decoration or section headings. (Scene art may use it: the beacon, a rock, Pip's antenna.)

**The Aqua Is Pip's Rule.** Aqua marks Pip and the station's signposting: Pip's body and bubble, the focus ring, small labels, Map mode headings, the safety line, the payoff card's border. It never fills a button; coral owns pressing.

**The Never-Color-Alone Rule.** Kelp and urchin always travel with words ("Done", "Not yet", "Think again"). A result that is only green or only pink is not finished.

**The Token Rainbow Rule.** Token chunks cycle coral, glow, sun, kelp, urchin in that fixed order with abyss text, in the Token Reef lab and on the canvas signs in the 3D station alike. Keep the order; kids learn to read it.

## Typography

**Display Font:** the game's system stack, `ui-rounded`, then SF Pro Rounded, Nunito, Segoe UI, `system-ui`
**Body Font:** the same stack
**Label/Mono Font:** `ui-monospace` stack, only for token chunks

**Character:** One heavy, friendly family does everything, set in black (900) for anything that names a place and bold (700) for anything you act on. It renders rounded where the device ships a rounded system face (Safari on Mac, iPhone and iPad) and falls back to the plain system face elsewhere, including Chromebooks; every surface has to hold up in both. The stack is pinned by the user ("keep the game's look") and no web fonts are downloaded. The 3D station's canvas signs paint with the same stack (minus the Segoe UI step, which `system-ui` covers) at 600 and 800.

### Hierarchy
- **Display** (900, clamp(3.75rem, 9vw, 6rem), 0.9, -0.03em tracking): the "Deep Dive" title on the start screen only, balanced wrap.
- **Headline** (900, 1.875rem, 1.2): lab titles in the dialog, the Map mode title, the Diver's License title, the big prompt line inside a lab ("strawberry"), and the loading status (2.25rem from 640px).
- **Title** (900, 1.5rem, 1.33): section headings inside a lab and "Bonus labs".
- **Subtitle** (700, 1.25rem, 1.4): the lesson's rule line (in coral), Map row titles, verdict lines, the start hatches (1.5rem from 640px). The start tagline uses this size at 400.
- **Body Large** (400, 1.125rem, 1.56): lab intro sentences and most lab text.
- **Body** (400, 1rem, 1.5): the start hint (max 60ch), the plaque's teacher line, Map row subtitles, the key list on the loading screen.
- **Label** (700, 0.875rem, 1.43): counters and captions in aqua ("Round 1 of 4", a story's temperature label).
- **Token** (mono, 700, 1.25rem): token chunks, with spaces drawn as middle dots and token ids at 0.75rem under each chunk.

### Named Rules
**The Heavy Voice Rule.** Headings are always 900 and anything pressable is 700. Nothing in the interface is set lighter than 400.

**The One Stack Rule.** DOM text and canvas signs share one font stack. Never add a second display face or download a font to fix how the fallback looks; fix the layout instead.

## Layout

Spacing runs on Tailwind's 4px base. Stacks inside a lab use 0.5rem to 1rem gaps; cards pad 1rem; every full-screen surface keeps a 1.25rem gutter on phones.

- **Start screen:** a hull that fills the viewport (`min-h-dvh`), content vertically centered in a container up to 80rem wide. From 1024px it is two columns, copy on the left and the porthole on the right (tracks 1fr and 1.15fr, 3.5rem gap), the porthole sized to min(100%, 74vh) with Pip's bubble hanging off its upper left rim. Below 1024px the porthole comes first at min(84vw, 44vh), then the title, tagline (max 26ch), hatches (full width pair on phones, natural width from 640px), hint and plaque (max 36rem). Gutters grow to 2.5rem from 640px.
- **Loading screen:** one centered column (max 42rem) on the hull: the sinking porthole at min(58vmin, 24rem), Pip's bubble with its tail pointing up at the glass, the status line, then keycaps for the controls. It scrolls if the viewport is short.
- **Map mode:** one column, max 48rem, 1.25rem gaps, padding 1.25rem growing to 2rem. Lab rows are full-width cards; the license row closes the core list; bonus labs follow under their own heading; the safety line sits at the foot.
- **Lab dialog:** a native modal, min(58rem, 96vw) wide, max 94vh tall, padding 1.25rem growing to 1.75rem, 1.25rem between blocks. A header row (Pip at 56px beside the title, rule and intro), then the lab's cards, then Back.

## Elevation & Depth

Depth is tonal first. Abyss is the floor, deep is the hull and dialog, panel is the card or plaque that sits on it; each lighter step is closer to the kid. Cards, wells, chips and the dialog cast no shadow. Real shadows belong only to physical parts of the sub, and they are long, soft and dropped low (negative spread), like objects lit from the station outside. Inset shadows do the metalwork: a dark ring and lower shade inside the brass rim, a vignette and glare on the glass, a 1px highlight along the top of the plaque and the hatches.

### Shadow Vocabulary
- **Porthole drop** (`box-shadow: 0 34px 60px -24px rgb(0 0 0 / 0.75), inset 0 0 0 3px #8a6420, inset 0 -6px 14px rgb(90 58 10 / 0.5)`): the brass rim only.
- **Glass vignette** (`box-shadow: inset 0 10px 40px 8px rgb(2 12 24 / 0.65)` plus a white radial glare at 30% 18%): the porthole glass.
- **Plaque** (`box-shadow: 0 16px 34px -18px rgb(0 0 0 / 0.8), inset 0 1px 0 rgb(255 255 255 / 0.06)`): the riveted safety plaque.
- **Bubble** (`box-shadow: 0 12px 28px -12px rgb(0 0 0 / 0.6)`): Pip's speech bubble.
- **Hatch** (`box-shadow: 0 10px 22px -12px rgb(0 0 0 / 0.7), inset 0 2px 0 rgb(255 255 255 / 0.25)` over a 5px bottom border at black 30%): the start screen's two buttons.
- **Bolt** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.5)`): each of the 12 rim bolts.

### Named Rules
**The Only-Objects-Cast Rule.** A shadow means "this is bolted into the sub." Porthole, plaque, bubble and hatches cast; interface cards stay flat and separate by tone.

**The Hull Plate Rule.** The hull is plates, not graph paper: one horizontal seam every 150px (2px dark line, 1px highlight) with a rivet row just below it (26px apart, sand at 16%), over a radial pool of panel light behind the porthole. One axis only. The detector flags it as a line field; it stays because it is the sub's material.

## Shapes

Everything is rounded; there are no sharp corners in the interface. Radius grows with size: 0.5rem for chips and keycaps, 0.75rem for buttons, inputs and wells, 1rem for cards, callouts and the plaque, 1.25rem for Pip's bubble, 1.5rem for the dialog and the license. Circles are reserved for the sub's hardware and for markers: the porthole, its bolts, plaque rivets, the mini porthole, and the 3rem lab badges. Borders are 2px on controls and cards (seam line at rest, aqua on hover), 3px on Pip's bubble, 4px on the license and the mini porthole ring. Speech bubble tails are a 16px square rotated 45 degrees with a 3px aqua border on the two outer sides. Pressable things carry a thicker bottom edge (5px on hatches, 4px on keycaps) so they read as keys.

## Components

### Buttons
Chunky and physical, like switches on a sub's control panel.
- **Shape:** gently rounded (0.75rem), inline icon and label with a 0.5rem gap, bold.
- **Primary:** coral fill, abyss text, 0.5rem by 1rem. Hover warms to coral-light. Disabled drops to 40% opacity.
- **Ghost:** transparent with a 2px seam-line border and sand text; hover turns the border aqua. Used for Back, Read to me, Walk in 3D, and the secondary start hatch.
- **Hatch (start screen):** the same fills at 1rem by 1.75rem with subtitle type, a 5px bottom edge (black 30% on coral, seam line on the ghost), a top highlight and the hatch shadow. Pressed, it drops 3px and the bottom edge shrinks to 2px. The ghost hatch sits on an abyss fill. On touch or no-WebGL devices Map mode takes the coral fill and Dive in becomes the ghost (disabled when there is no WebGL); autofocus follows the coral one.
- **Icons:** 24px inline SVG, 2.5 stroke, round caps and joins, `currentColor` (the diver's arrow through waves, the folded map).
- **Focus:** a 3px aqua outline offset 3px, global to every focusable element.

### Chips
- **Style:** transparent, 2px seam-line border, 0.5rem radius, semibold, 0.25rem by 0.75rem. Hover turns the border aqua.
- **State:** `aria-pressed` fills coral with abyss text. Used for number guesses and word suggestions.

### Cards / Containers
- **Card:** panel fill, 1rem radius, 1rem padding, no shadow, no border by default. Each lab's content sits in one or more cards.
- **Payoff card:** a card with a 2px aqua border; it closes a lab with the result and is usually a live region.
- **Goal callout:** abyss fill, 2px coral border, 1rem radius, 1rem padding, title or subtitle type. States the lab's challenge.
- **Well:** abyss fill, 2px seam-line border, 0.75rem radius, 1rem padding. Holds generated output (the machine's story).
- **Dialog:** deep fill, 2px seam-line border, 1.5rem radius; backdrop is abyss-black at 70%.

### Inputs / Fields
- **Style:** abyss fill, 2px seam-line border, 0.75rem radius, 0.5rem by 0.75rem, set at 1.125rem to 1.25rem so kids can read what they typed. Always labeled above in a column. Autocomplete off.
- **Focus:** the global aqua ring.
- **Range:** the native slider with a coral accent and its end labels underneath at 0.875rem.

### Navigation
Map mode is the navigation. Each lab is a full-width card button with a 2px seam-line border (aqua on hover): a 3rem coral badge with the lab number in black weight, the lab title in subtitle type, the rule under it in sand at 80%, and a status at the right ("Done" in kelp, "Not yet" in sand at 60%). The Diver's License row uses a coral border and an aqua badge. There is no top bar; the dialog's Back button returns to wherever the kid was.

### Porthole (signature)
A circle with a 7% brass rim painted as a conic gradient from 210 degrees, 12 bolts at 30 degree steps (each 3.6% of the diameter, 1.6% in from the edge, a lit brass sphere), a 4px dark brass ring around the glass, and a glass vignette with a top-left glare. Through it, an inline 400 by 400 SVG: water from sea-top to #062a45, three light rays, the station on the sea floor with eight lab windows lit in each lab's color from the floor plan, a glowing airlock, a blinking coral beacon, kelp, rocks, a yellow fish school, rising bubbles, and Pip waving by the glass. The sinking variant is the loading screen. The whole thing is `role="img"` with a spoken label.

### Pip's Bubble (signature)
Sand fill, 3px aqua border, 1.25rem radius, bold abyss text, the bubble shadow, and a rotated-square tail aimed at Pip. On the start screen it hangs on the porthole rim with the tail down; on the loading screen it sits under the glass with the tail up and swaps its line every 2.8s with a 0.5s fade-and-rise.

### Safety Plaque (signature)
A panel-to-deep gradient at 95% opacity, 1px seam-line border, 1rem radius, 1.25rem by 1.5rem padding, the plaque shadow, and four 8px steel rivets set 0.5rem in from each corner. The safety line is bold aqua; the teacher line is sand at 80%.

### Keycap
Inline grid, 2rem tall, at least 2rem wide, 0.5rem radius, 2px seam-line border with a 4px bottom edge, panel fill, 800 weight at 0.95rem. Teaches the station's keys on the loading screen while the 3D chunk downloads.

### Mini Porthole
A 2.75rem circle with a 4px brass ring and sea-top to sea-mid water inside, with three 7px bubbles rising on a 1.4s loop, staggered 0.45s. It sits beside the loading line inside a card while a lab's game downloads.

## Do's and Don'ts

### Do:
- **Do** set every full-screen surface on the riveted hull, or on abyss with sand text, and every lab on panel cards inside the deep dialog.
- **Do** draw new scene art as inline SVG or CSS gradients in the palette above; the start, loading and Map screens download no images and no fonts.
- **Do** give anything pressable a coral fill or a 2px seam-line ghost border, and on physical hatches a 5px bottom edge that drops 3px when pressed.
- **Do** show focus with the 3px aqua ring offset 3px, and keep Map mode a coral primary on touch and no-WebGL devices.
- **Do** pair every kelp or urchin result with words.
- **Do** let the water move (sway, rise, swim, bob, blink) and let `prefers-reduced-motion` stop all of it; every scene must read correctly frozen.
- **Do** cycle token colors coral, glow, sun, kelp, urchin in that order, in the DOM and on canvas.

### Don't:
- **Don't** add a second axis to the hull seams or turn them into a grid.
- **Don't** put shadows on interface cards, chips or the dialog; shadows are for the porthole, plaque, bubble and hatches.
- **Don't** use coral for interface decoration or section headings, and don't fill a button with aqua.
- **Don't** draw Pip in any color but aqua with an abyss visor.
- **Don't** download a web font or swap the stack; the user pinned the game's look.
- **Don't** let a surface read as babyish (made for 6 year olds) or as a corporate AI startup landing page.
