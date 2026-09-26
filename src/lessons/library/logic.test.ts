import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BOOKS } from '../../content.ts'
import { train } from '../guess/logic.ts'
import { animalsIn, topAfter, wins } from './logic.ts'

test('retraining changes what Pip says', () => {
  const zoo = train('The fox ran. The wolf ran. The fox slept.')
  const ship = train('The ship sailed. The captain slept. The ship sank.')
  assert.deepEqual(topAfter(zoo), ['fox', 'wolf'])
  assert.deepEqual(animalsIn(topAfter(ship)), [])
  assert.deepEqual(new Set(topAfter(train('The fox ran. The ship sailed.'))), new Set(['fox', 'ship']))
})

const book = (i: number) => readFileSync(new URL(`../../../public/books/${BOOKS[i].file}`, import.meta.url), 'utf8')

test('real books: the animal challenge is winnable, and not with Treasure Island alone', () => {
  assert.equal(wins(train(book(2))), true, 'Aesop alone')
  assert.equal(wins(train(book(1))), false, 'Treasure Island alone')
})

test('real books: no "ass" left after the donkey swap', () => {
  assert.doesNotMatch(book(2), /\bass(es)?\b/i)
})
