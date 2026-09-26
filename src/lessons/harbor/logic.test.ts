import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HARBOR } from '../../content.ts'
import { grade } from './logic.ts'

const bin = (id: string) => HARBOR.cards.find((c) => c.id === id)!.answer

test('the kit cards land in the right bins', () => {
  assert.equal(bin('color'), 'ok')
  assert.equal(bin('address'), 'private')
  assert.equal(bin('password'), 'private')
  assert.ok(HARBOR.cards.every((c) => HARBOR.choices.some((ch) => ch.id === c.answer) && c.why.length > 0))
})

test('grading uses the key', () => {
  assert.ok(grade(Object.fromEntries(HARBOR.cards.map((c) => [c.id, c.answer]))).every((r) => r.ok))
  assert.equal(grade({ password: 'ok' }).find((r) => r.id === 'password')!.ok, false)
})
