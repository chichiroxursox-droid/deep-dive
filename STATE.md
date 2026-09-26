# STATE: Deep Dive

Read this first at every session start. Append one entry per milestone, newest at the bottom. Never rewrite old entries.

If a checkpoint slips 90 minutes, apply the next scope cut (see CLAUDE.md) and log it.

## Checkpoints (build started Sat 1:21pm EDT)

| Clock | Done when | Status |
|---|---|---|
| Sat 2:51pm | Hour 1 timebox: deployed to prod, diver walks the hall with a third-person camera (else fixed-camera fallback) | |
| Sat ~4:00pm | Lesson 1 Token Reef playable in Map mode, test green, deployed | |
| Sat ~5:00pm | Lesson 2 Guessing Machine, same bar | |
| Sat ~6:00pm | Lesson 3 Backpack, same bar. LESSONS.md review flag raised | |
| Sat ~7:00pm | Lessons 4 Robot Chef and 5 Fact Check, same bar | |
| **Sat 9:00pm** | **GATE: lessons 1 to 5 playable on prod in Map mode AND reachable from bays in the 3D hall** | |
| Sat night | Nice-to-haves in kit order: Toolbox, Library, Safe Harbor, read-aloud | |
| **Sun 8:00am** | **CODE FREEZE.** After this only README, DEMO.md, DEVPOST.md, video | |
| Sun 9:15am | Submitted | |

## Log

### Sat 1:56pm, scaffold
- Milestone: hit. Vite + React 19.3 + TS 7 + Tailwind 4 + fiber/drei/rapier/ecctrl 2 installed, peer deps clean (react 19.3.0 fits fiber <19.4 and ecctrl >=19.2.7).
- Done-when result: `npm run build` passes. Start screen, Map mode list, lesson overlay (native dialog), Diver's License, and the 3D hall with 5 bays + license kiosk are written. World is a lazy chunk so Map mode never loads three.js.
- Prod URL works: not deployed yet. Tests: none yet.
- What broke: npm install got cut off by a session restart; Tailwind 4 can't @apply classes from @layer components (switched to @utility).
- Found: ecctrl v2 doesn't read the keyboard itself; input is fed via `setMovement` from drei KeyboardControls each frame.
- Sources: Fact Check NOAA pages and the Philly SD page were fetched and quoted today. Code.org's 84%/16% aren't in that page's static HTML, so quote them exactly as the kit's verified wording.
- Next step: git + GitHub repo + first `vercel --prod`, then walk-test the diver.
- Scope cuts so far: none.
