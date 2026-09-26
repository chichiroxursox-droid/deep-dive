// Exports every word kids read (src/content.ts) to LESSONS.md for accuracy review.
import { writeFileSync } from 'node:fs'
import * as C from '../src/content.ts'

const perLesson: Record<string, unknown> = { tokens: C.TOKENS, guess: C.GUESS, backpack: C.BACKPACK, chef: C.CHEF, factcheck: C.FACTS, toolbox: C.TOOLBOX, library: C.LIBRARY, harbor: C.HARBOR }

const line = (v: unknown): string =>
  typeof v === 'object' && v !== null ? Object.entries(v).map(([k, x]) => `${k}: ${Array.isArray(x) ? x.join(', ') : String(x)}`).join('; ') : String(v)

function block(obj: unknown, id = ''): string {
  const flag = (k: string) => (C.CHECK[`${id}.${k}`] ? ` **[CHECK: ${C.CHECK[`${id}.${k}`]}]**` : '')
  return Object.entries(obj as object)
    .map(([k, v]) => (Array.isArray(v) ? `- **${k}**:${flag(k)}\n${v.map((x) => `  - ${line(x)}`).join('\n')}` : `- **${k}**: ${line(v)}${flag(k)}`))
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
  "## Diver's License",
  block(C.LICENSE),
  '',
  '## Books the language model reads (public domain)',
  ...C.BOOKS.map((b) => `- ${b.title}, ${b.author}. Project Gutenberg #${b.gutenberg}`),
  '',
]
writeFileSync(new URL('../LESSONS.md', import.meta.url), out.join('\n'))
console.log('LESSONS.md written')
