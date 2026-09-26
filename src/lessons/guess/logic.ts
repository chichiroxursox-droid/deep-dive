// A tiny word-level language model: trigram counts with bigram backoff.
// Every probability shown in the app comes from these counts.

export type Guess = { word: string; p: number }
export type Model = { tri: Map<string, Map<string, number>>; bi: Map<string, Map<string, number>>; words: number }

export function words(text: string): string[] {
  return text.toLowerCase().replace(/[‘’]/g, "'").match(/[a-z]+(?:'[a-z]+)*|[.,!?]/g) ?? []
}

function bump(m: Map<string, Map<string, number>>, key: string, next: string) {
  let row = m.get(key)
  if (!row) m.set(key, (row = new Map()))
  row.set(next, (row.get(next) ?? 0) + 1)
}

export function train(text: string): Model {
  const w = words(text)
  const tri = new Map<string, Map<string, number>>()
  const bi = new Map<string, Map<string, number>>()
  for (let i = 0; i < w.length - 1; i++) {
    bump(bi, w[i], w[i + 1])
    if (i > 0) bump(tri, `${w[i - 1]} ${w[i]}`, w[i + 1])
  }
  return { tri, bi, words: w.length }
}

// What came after the last two words in the books. If that pair never showed up, back off to the last word.
export function nextWords(m: Model, context: string[]): { dist: Guess[]; from: 'trigram' | 'bigram' | 'none' } {
  const [a, b] = context.slice(-2)
  let from: 'trigram' | 'bigram' = 'trigram'
  let row = context.length >= 2 ? m.tri.get(`${a} ${b}`) : undefined
  if (!row) {
    row = m.bi.get(context[context.length - 1])
    from = 'bigram'
  }
  if (!row) return { dist: [], from: 'none' }
  let total = 0
  for (const c of row.values()) total += c
  const dist = [...row].map(([word, c]) => ({ word, p: c / total }))
  dist.sort((x, y) => y.p - x.p || (x.word < y.word ? -1 : 1))
  return { dist, from }
}

// Temperature 0 always takes the top word. Higher temperature flattens the odds, so long shots win more often.
export function pick(dist: Guess[], temperature: number, rand: () => number): string {
  if (temperature <= 0) return dist[0].word
  const weights = dist.map((g) => g.p ** (1 / temperature))
  let r = rand() * weights.reduce((s, w) => s + w, 0)
  for (let i = 0; i < dist.length; i++) {
    r -= weights[i]
    if (r <= 0) return dist[i].word
  }
  return dist[dist.length - 1].word
}

export function generate(m: Model, start: string[], n: number, temperature: number, rand: () => number): string[] {
  const out = [...start]
  for (let i = 0; i < n; i++) {
    const { dist } = nextWords(m, out)
    if (!dist.length) break
    out.push(pick(dist, temperature, rand))
  }
  return out.slice(start.length)
}

// Small seeded random generator so a story can be replayed exactly.
export function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Words back into a sentence: no space before punctuation, capitals after a period.
export function toText(w: string[], capitalFirst = false): string {
  let s = ''
  let cap = capitalFirst
  for (const word of w) {
    const punct = /^[.,!?]$/.test(word)
    const shown = word === 'i' ? 'I' : cap && !punct ? word[0].toUpperCase() + word.slice(1) : word
    s += (punct || !s ? '' : ' ') + shown
    if (!punct) cap = false
    if (/^[.!?]$/.test(word)) cap = true
  }
  return s
}

let books: Promise<string[]> | undefined
// Same-origin static files in public/books. Fetched once, then reused by every lab that trains.
export function loadBooks(files: string[]): Promise<string[]> {
  return (books ??= Promise.all(files.map((f) => fetch(`/books/${f}`).then((r) => r.text()))))
}

let model: Promise<Model> | undefined
// The Guessing Machine's model reads all the books. Trained once, then reused every time the lab opens.
export const loadModel = (files: string[]) => (model ??= loadBooks(files).then((t) => train(t.join('\n'))))
