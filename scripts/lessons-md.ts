// Exports every word kids read (src/content.ts) to LESSONS.md for accuracy review.
import { writeFileSync } from 'node:fs'
import * as C from '../src/content.ts'

const perLesson: Record<string, unknown> = { tokens: C.TOKENS, guess: C.GUESS, backpack: C.BACKPACK, chef: C.CHEF, factcheck: C.FACTS, toolbox: C.TOOLBOX, library: C.LIBRARY, harbor: C.HARBOR }

// Nested bullets for copy of any shape, so no string hides inside an object.
function block(obj: unknown, id = '', depth = 0): string {
  const pad = '  '.repeat(depth)
  const flag = (k: string) => (depth === 0 && C.CHECK[`${id}.${k}`] ? ` **[CHECK: ${C.CHECK[`${id}.${k}`]}]**` : '')
  const list = Array.isArray(obj)
  return Object.entries(obj as object)
    .map(([k, v]) => {
      const label = list ? '' : `**${k}**: `
      if (v === null || typeof v !== 'object') return `${pad}- ${label}${v}${flag(k)}`
      return `${pad}- ${label || `(${Number(k) + 1})`}${flag(k)}\n${block(v, id, depth + 1)}`
    })
    .join('\n')
}

const out = [
  '# LESSONS: every word a kid reads in Deep Dive',
  '',
  'Generated from `src/content.ts` by `npm run lessons`. Do not hand-edit the app copy anywhere else.',
  'Ethan: edit this file or leave notes, and the edits get ported back into content.ts. Lines marked [CHECK] are AI claims waiting for your OK.',
  'Token splits and word probabilities are never written here: the app computes them from the real tokenizer and the in-browser model.',
  '',
  '## Start screen and kid safety',
  block({ ...C.START, safety: C.SAFETY }),
  '',
  ...C.LESSONS.flatMap((l) => [
    `## Lab ${l.num}: ${l.title}`,
    `- **Rule**: ${l.rule}`,
    `- **Intro**: ${l.intro.join(' ')}`,
    `- **AI4K12 Big Idea**: ${l.bigIdea}`,
    `- **What is real**: ${l.real}`,
    perLesson[l.id] ? block(perLesson[l.id], l.id) : '- (game copy not written yet)',
    '',
  ]),
  '## 3D hall',
  block(C.HALL),
  '',
  '## Buttons and labels',
  block({ ...C.UI, ...C.READ }),
  '',
  "## Diver's License",
  block(C.LICENSE),
  '',
  '## Books the language model reads (public domain)',
  ...C.BOOKS.map((b) => `- ${b.title}, ${b.author}. Project Gutenberg #${b.gutenberg}`),
  '',
]
writeFileSync(new URL('../LESSONS.md', import.meta.url), out.join('\n'))
console.log('LESSONS.md written')
