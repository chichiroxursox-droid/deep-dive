# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Kids ages 10 to 14 (grades 5 to 8), playing alone, usually on a school Chromebook or a family laptop, in about 20 minutes. The start screen has to win them over first: they should want to press Dive in within a few seconds. Teachers and parents are the second audience; they need to see at a glance that it is safe, short, and needs no sign-up. OwlHacks 2026 judges (HCI track) also play it.

## Product Purpose

A 3D browser game that teaches how AI chatbots work. A diver walks an underwater research station; each lab room teaches one idea (tokens, next-word guessing, the context window, prompting, checking facts, plus bonus labs on tools, training-data bias and privacy) with a mini game that runs the real mechanism at kid size. Finishing the 5 core labs earns a Diver's License. Success: a kid finishes the core labs and can say the five rules in their own words.

## Positioning

Nothing is faked. Token splits come from the real GPT-4o tokenizer (o200k_base) running in the browser, and word guesses come from a real language model trained in the browser on three public-domain books. Other kids' AI lessons are teacher-led slides or menus; this is a game a kid plays alone, and every number on screen is computed live.

## Operating Context

School Chromebooks (often slow, sometimes offline), shared family laptops, phones and tablets (routed to Map mode). Map mode plays every lab with no 3D, keyboard only, and never downloads three.js. The 3D station is a separate lazy download.

## Capabilities and Constraints

- Static site on Vercel. No server, no accounts, no analytics, no live AI call, no API keys. Nothing a kid types leaves the page.
- Never hardcode a token split or a probability.
- All kid-facing copy lives in `src/content.ts` and is exported to LESSONS.md for accuracy review.
- Copy at a grade 5 reading level. AI "guesses" or "predicts", never "knows", "thinks" or "understands". No em dashes in UI copy.
- The start screen and Map mode must stay small: no image downloads, no new dependencies.
- Code freeze Sun Sept 27 2026, 8:00am EDT.

## Brand Commitments

- Name: Deep Dive. Place: Deep Dive Research Station. Guide: Pip, a small aqua robot, referred to as "it".
- The start and loading screens keep the game's existing look (the user confirmed): the same colors, font and character as the 3D station and the labs.
- Must not feel babyish (made for 6 year olds) or corporate/techy (an AI startup landing page).

## Evidence on Hand

- Real mechanisms: js-tiktoken o200k_base, the in-browser trigram model, three Project Gutenberg excerpts in `public/books/`.
- Safety line (SAFETY in content.ts): "No accounts. No chatting with a live AI. Nothing you type leaves this page. Map mode works offline once it loads."
- Teacher line: about 20 minutes, ages 10 to 14, no sign-up.
- No testimonials, classroom pilots or user numbers exist yet. Do not invent them.

## Product Principles

1. Honest mechanisms: show the real thing working, at kid size.
2. A kid can play alone, start to finish, with no adult setup.
3. Every lab is reachable by keyboard alone and without 3D.
4. Safety is visible, not buried: no accounts, no live AI, nothing leaves the page.

## Accessibility & Inclusion

Keyboard-only play with a visible focus ring; Map mode for no-WebGL, touch, and reduced-motion users (the start screen points them there); prefers-reduced-motion honored; text contrast at WCAG AA; Read to me narration on every lab.
