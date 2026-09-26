import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cook, count, stars } from './logic.ts'
import { CHEF } from '../../content.ts'

test('all cards give 5 stars and mention Maya and sharks', () => {
  const lines = cook(new Set(CHEF.cards.map((c) => c.id)))
  const text = lines.map((l) => l.text).join(' ')
  assert.equal(count(stars(lines)), 5)
  assert.match(text, /Maya/)
  assert.match(text, /shark/i)
  assert.equal(lines.length, 3)
})

test('task card alone gives 1 star', () => {
  const s = stars(cook(new Set(['task'])))
  assert.equal(count(s), 1)
  assert.equal(s.card, true)
})

test('no cards gives 0 stars, and output is deterministic', () => {
  assert.equal(count(stars(cook(new Set()))), 0)
  assert.deepEqual(cook(new Set(['who', 'tone'])), cook(new Set(['tone', 'who'])))
})

test('each goal card earns its own star', () => {
  const base = ['task', 'who', 'details', 'length', 'tone']
  for (const drop of base) assert.equal(count(stars(cook(new Set(base.filter((c) => c !== drop))))), 4, `without ${drop}`)
})
