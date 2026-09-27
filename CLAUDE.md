# Deep Dive

Browser game for kids 10 to 14. A diver walks around an underwater research station; each lab bay teaches one idea about how chatbots work, with a mini game that runs the real mechanism at kid size. OwlHacks 2026, solo, HCI track. All code written during the event (MLH rule 9), nothing reused from other repos.

**Start every session by reading `STATE.md`.** Append a log entry after every milestone.

## Hard rules
- Static site only. No server, no API routes, no keys, no live AI call, no accounts, no analytics. Nothing the kid types leaves the page.
- Never hardcode a token split or a probability. Token splits come from js-tiktoken (o200k_base, the GPT-4o tokenizer). Word probabilities come from the in-browser trigram model trained on `public/books/`.
- All lesson copy lives in `src/content.ts`. `npm run lessons` regenerates `LESSONS.md` for Ethan's review. Unsure AI claims get `[CHECK]`. When Ethan edits LESSONS.md, port the edits back into content.ts and regenerate.
- Copy: grade 5 reading level, 2 to 4 short sentences per lesson. Guide is Pip, a robot ("it"). AI "guesses" or "predicts", never "knows", "thinks" or "understands".
- No em dashes in UI copy, README, DEMO.md, DEVPOST.md.
- Public-domain text only (Project Gutenberg excerpts, header stripped, credited in README).
- Code freeze Sun Sept 27 8:00am EDT. After that only README, DEMO.md, DEVPOST.md, video.
- Same error survives 3 fix attempts: stop, apply the next scope cut, log it.

## Stack
Vite + React 19.3 + TypeScript, Tailwind 4, three + @react-three/fiber 9 + drei 10 + rapier 2 + ecctrl 2 (leva installed only as ecctrl's peer). js-tiktoken lite, ranks lazy-loaded. Tests: `node --test` running `.ts` directly (Node 24 type stripping), so imports use `.ts` extensions and syntax must be erasable (no enums).

## Layout
- `src/content.ts` all lesson text, Fact Check guide + sources, Chef fragments, Backpack chat.
- `src/lessons/<id>/` `Lesson.tsx` (overlay UI), `logic.ts` (pure), `logic.test.ts`.
- `src/world/` the 3D station, lazy-loaded so Map mode never downloads three.js.
  - `layout.ts` floor plan as pure data (rooms, walls, doors, `areaAt`), with `layout.test.ts`. Change the station here.
  - `Station.tsx` walls, ceiling, lobby, deck, consoles, Pip. `Rooms.tsx` themed props per lab. `Ocean.tsx` sea floor outside.
  - `Demos.tsx` Next Word Machine (real model odds), Backpack belt (lesson's `add()`), kickable balls. `Diver.tsx` ecctrl diver + camera.
  - `textures.ts` canvas-painted textures and cached materials (no image downloads). `goggles()` repaints every `sign()` texture as real token chunks (Token goggles, T key). `parts.tsx` `Solid`, `Board`, `StaticBatch`.
  - The camera always faces -z: put screens, signs and machine fronts on far walls facing +z. Mark anything that moves or changes its picture `userData.dynamic` so `StaticBatch` skips it.
- `src/MapMode.tsx` keyboard-only list of every lesson, same overlays. Never cut.
- `src/Certificate.tsx` Diver's License ending.
- `scripts/lessons-md.ts` content.ts to LESSONS.md.

## Scope cut order (apply in order when behind)
1 Safe Harbor, 2 read-aloud, 3 Library, 4 Toolbox agent twist, 5 Toolbox, 6 bay props beyond sign + one prop, 7 fog and bubble polish.
Never cut: lessons 1 to 5 and their tests, Map mode, the kid-safety line, LESSONS.md.

## Deploy
`vercel --prod --scope chiethan` after every milestone. GitHub: chichiroxursox-droid/deep-dive (public).
