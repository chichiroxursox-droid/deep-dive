import { test } from 'node:test'
import assert from 'node:assert/strict'
import { add, CAPACITY, empty, pin, toss, used, type Item, type Pack } from './logic.ts'
import { countTokens, loadEncoder } from '../tokens/logic.ts'
import { BACKPACK } from '../../content.ts'

const items = (sizes: number[]): Item[] => sizes.map((tokens, id) => ({ id, text: `m${id}`, tokens }))

test('capacity math: total never goes over the limit', () => {
  let p = empty()
  for (const it of items([25, 25, 25])) p = add(p, it, 60)
  assert.equal(used(p.items), 50)
  assert.ok(used(p.items) <= 60)
})

test('eviction order: oldest message falls out first', () => {
  let p = empty()
  for (const it of items([20, 20, 20, 20, 20])) p = add(p, it, 60)
  assert.deepEqual(p.dropped.map((x) => x.id), [0, 1])
  assert.deepEqual(p.items.map((x) => x.id), [2, 3, 4])
})

test('pinned item survives, the next oldest falls out instead', () => {
  let p = empty()
  const [a, ...rest] = items([20, 20, 20, 20, 20])
  p = pin(add(p, a, 60), a.id)
  for (const it of rest) p = add(p, it, 60)
  assert.ok(p.items.some((x) => x.id === a.id))
  assert.deepEqual(p.dropped.map((x) => x.id), [1, 2])
})

test('toss removes a message and frees its tokens', () => {
  let p = empty()
  for (const it of items([10, 10])) p = add(p, it, 60)
  p = toss(p, 0)
  assert.deepEqual(p.items.map((x) => x.id), [1])
  assert.equal(p.tossed[0].id, 0)
})

// The real chat, weighed by the real tokenizer.
async function play(act: (p: Pack, it: Item) => Pack) {
  const enc = await loadEncoder()
  let p = empty()
  const all = [...BACKPACK.chat, { from: 'you', text: BACKPACK.question }].map((m, id) => ({ id, text: m.text, tokens: countTokens(enc, m.text) }))
  for (const it of all) p = act(add(p, it), it)
  return p.items.some((x) => x.id === 0)
}

test('real chat: doing nothing loses the dog\'s name', async () => {
  assert.equal(await play((p) => p), false)
})

test('real chat: pinning the fact keeps it', async () => {
  assert.equal(await play((p, it) => (it.id === 0 ? pin(p, 0) : p)), true)
})

test('real chat: tossing the filler keeps it', async () => {
  const filler = BACKPACK.chat.flatMap((m, i) => ('filler' in m && m.filler ? [i] : []))
  assert.equal(await play((p, it) => (filler.includes(it.id) ? toss(p, it.id) : p)), true)
  assert.ok(CAPACITY === 60)
})
