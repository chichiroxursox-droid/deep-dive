import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generate, nextWords, pick, seeded, toText, train } from './logic.ts'

const m = train('The cat sat on the mat. The cat ate the fish.')

test('fixture corpus gives exact trigram probabilities', () => {
  assert.deepEqual(nextWords(m, ['the', 'cat']), { from: 'trigram', dist: [{ word: 'ate', p: 0.5 }, { word: 'sat', p: 0.5 }] })
  assert.deepEqual(nextWords(m, ['on', 'the']), { from: 'trigram', dist: [{ word: 'mat', p: 1 }] })
})

test('unseen pair backs off to the bigram', () => {
  assert.deepEqual(nextWords(m, ['a', 'the']), {
    from: 'bigram',
    dist: [{ word: 'cat', p: 0.5 }, { word: 'fish', p: 0.25 }, { word: 'mat', p: 0.25 }],
  })
  assert.equal(nextWords(m, ['zebra']).from, 'none')
})

test('temperature 0 always picks the top word', () => {
  const { dist } = nextWords(m, ['a', 'the'])
  for (let i = 0; i < 50; i++) assert.equal(pick(dist, 0, Math.random), 'cat')
})

test('seeded sampling repeats exactly', () => {
  const a = generate(m, ['the'], 12, 1.5, seeded(42))
  const b = generate(m, ['the'], 12, 1.5, seeded(42))
  assert.deepEqual(a, b)
  assert.ok(a.length > 0)
})

test('words become a sentence', () => {
  assert.equal(toText(['the', 'cat', 'sat', '.', 'i', 'ran', '!'], true), 'The cat sat. I ran!')
})
