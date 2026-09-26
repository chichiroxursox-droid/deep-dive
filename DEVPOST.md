# Deep Dive

**Tagline:** A 3D underwater game where kids learn how chatbots really work, and every lesson runs the real mechanism.

**Track:** HCI. Second track if the form allows: Philly Special.
**Also entering:** Best Use of ElevenLabs (the Read to me narration), if that prize is listed.

**Try it:** https://deep-dive-rosy.vercel.app
**Code:** https://github.com/chichiroxursox-droid/deep-dive

## Inspiration

Code.org's 2025 State of AI + CS Education Report found that 84% of students use AI, but only 16% are being taught to understand it (https://advocacy.code.org/stateofcs/). Here in Philadelphia, the School District approved Google Gemini and Adobe Express with Firefly "for staff and student use." The AI training it lists is a staff course on data privacy and AI fundamentals. No student lessons are listed (https://www.philasd.org/pstv/ai-resources/).

Free AI curricula exist, but they are teacher-led and most kids never get them. I wanted something a 12-year-old could play alone on a school Chromebook in 20 minutes.

## What it does

You walk a diver around an underwater research station. At each lab, Pip the robot explains one idea, then a mini game runs the real thing at kid size:

1. **Token Reef:** guess how many tokens a word is, then see the real split from GPT-4o's tokenizer. "strawberry" is 10 letters but 3 tokens.
2. **Guessing Machine:** a real language model trains in your browser on three public-domain books, shows its top 5 next-word guesses as probability bars, and writes stories with a temperature dial. Cold repeats itself. Hot gets silly.
3. **Backpack:** a 60-token context window. Your dog's name falls out of the chat and Pip guesses wrong, until you pin it.
4. **Robot Chef:** build a prompt from cards and see how many stars Pip's birthday card earns.
5. **Fact Check Lagoon:** Pip is "99% sure" about five sea facts. Check them against a Field Guide linked to NOAA sources.

Three bonus labs cover tools and agents (approve or deny each step Pip wants to take), training-data bias (pick the books Pip reads), and what never to tell a chatbot. Finishing the core labs earns a Diver's License.

## How it's HCI

- **Map mode** plays every lab with no 3D, keyboard only, with visible focus. It skips the 3D engine entirely, so it works on weak Chromebooks, without WebGL, and for kids who need less motion.
- Grade 5 reading level and a Read to me button on every lab.
- Nothing is faked: token splits and probabilities are computed live.
- **Kid safety:** no accounts, no chatting with a live AI, nothing you type leaves the page, and it works offline once it loads.

## How I built it

React, TypeScript and three.js (react-three-fiber, rapier, ecctrl for the diver), static on Vercel. js-tiktoken runs the o200k_base tokenizer in the browser. The language model is a trigram model with bigram backoff, trained on Project Gutenberg excerpts. All lesson text lives in one file that exports to LESSONS.md for accuracy review. 31 unit tests cover every lab's logic, and scripted Playwright runs played the live site keyboard-only with the network off. Narration was recorded once with ElevenLabs and ships as MP3s.

**AI disclosure:** I built Deep Dive with Claude Code as my coding agent. No AI runs at runtime.

## Challenges

- Keeping lessons honest: the Backpack had to lose the dog's name using real token counts, so the chat was tuned against the real tokenizer and a test locks it in.
- A 1912 Aesop translation taught the model a word I didn't want in a kids' game, so I swapped it for "donkey" and disclosed it.

## What I learned

A tiny model you can retrain with one click teaches "it only knows what it read" better than any sentence can.

## What's next

- Test with real 5th to 8th graders and a screen reader user
- A Perception lab, since that Big Idea isn't covered yet
- Touch controls, and a teacher page that maps each lab to AI4K12

**Built with:** react, typescript, vite, three.js, rapier, ecctrl, js-tiktoken, tailwind, elevenlabs, vercel
