# Deep Dive

**Tagline:** A 3D underwater game where kids learn how chatbots really work, and every lesson runs the real mechanism.

**Track:** HCI. Second track if the form allows: Philly Special.
**Also entering:** Best Use of ElevenLabs, if that prize is listed.

**Try it:** https://deep-dive-rosy.vercel.app
**Code:** https://github.com/chichiroxursox-droid/deep-dive

## Inspiration

Code.org's 2025 State of AI + CS Education Report found that 84% of students use AI, but only 16% are being taught to understand it (https://advocacy.code.org/stateofcs/). In Philadelphia, the School District approved Google Gemini and Adobe Express with Firefly "for staff and student use." The AI training it lists is a staff course on data privacy and AI fundamentals. No student lessons are listed (https://www.philasd.org/pstv/ai-resources/).

Free AI curricula exist, but they are teacher-led and most kids never get them. I wanted something a 12-year-old could play alone on a school Chromebook in 20 minutes.

## What it does

You walk a diver from the sea floor into an underwater research station with a corridor of themed lab rooms. At each room's glowing console, Pip the robot explains one idea, then a mini game runs the real thing at kid size:

1. **Token Reef:** guess how many tokens a word is, then see the real split from GPT-4o's tokenizer. "strawberry" is 10 letters but 3 tokens.
2. **Guessing Machine:** a real language model trains in your browser on three public-domain books, shows its top 5 next-word guesses, and writes stories with a temperature dial: cold repeats itself, hot gets silly.
3. **Backpack:** a 60-token context window. Your dog's name falls out of the chat and Pip guesses wrong, until you pin it.
4. **Robot Chef:** build a prompt from cards and see how many stars Pip's birthday card earns.
5. **Fact Check Lagoon:** Pip is "99% sure" about five sea facts. Check them against a Field Guide linked to NOAA sources.

Two rooms have hands-on 3D physics: a Next Word Machine drops balls into word tubes using the real model's odds, and a belt pushes the oldest chat message out of a 60-token backpack. Press T for **token goggles**: every sign in the station is re-split into colored tokens by the real tokenizer, so the whole world becomes Lab 1. Three bonus labs cover tools and agents, training-data bias, and what never to tell a chatbot. Finishing the core labs earns a Diver's License.

## How it's HCI

- **Map mode** plays every lab with no 3D, keyboard only, with visible focus. It skips the 3D engine, so it works on weak Chromebooks and for kids who need less motion.
- Grade 5 reading level and a Read to me button on every lab.
- Nothing is faked: token splits and probabilities are computed live.
- **Kid safety:** no accounts, no chatting with a live AI, nothing you type leaves the page, and Map mode works offline once it loads.

## How I built it

React, TypeScript and three.js (react-three-fiber, rapier, ecctrl for the diver), static on Vercel. Textures are painted on canvases at runtime and still meshes merge on load, so it holds 60 fps. js-tiktoken runs the o200k_base tokenizer in the browser. The language model is a trigram model with bigram backoff, trained on Project Gutenberg excerpts. All lesson text exports to LESSONS.md for accuracy review. 36 unit tests cover every lab's logic, and Playwright scripts played the live site keyboard-only, offline. Narration was recorded once with ElevenLabs and ships as MP3s.

**AI disclosure:** I built Deep Dive with Claude Code as my coding agent. No AI runs at runtime.

## Challenges

- Keeping lessons honest: the Backpack had to lose the dog's name using real token counts, so the chat was tuned against the real tokenizer and a test locks it.
- A 1912 Aesop translation taught the model a word unfit for kids, so I swapped it for "donkey" and disclosed it.

## What's next

- Test with real 5th to 8th graders and a screen reader user
- A Perception lab, since that Big Idea isn't covered yet
- Touch controls, and a teacher page that maps each lab to AI4K12

**Built with:** react, typescript, vite, three.js, rapier, ecctrl, js-tiktoken, tailwind, elevenlabs, vercel
