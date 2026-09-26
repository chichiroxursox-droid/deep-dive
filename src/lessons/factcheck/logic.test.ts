import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FACTS } from '../../content.ts'
import { grade, guideEntry } from './logic.ts'

test('answer key matches the guide', () => {
  for (const c of FACTS.claims) {
    if (c.answer === 'missing') {
      assert.equal(c.guide, undefined, c.id)
      const subject = (c as { subject?: string }).subject!
      assert.ok(subject, `${c.id} needs a subject`)
      for (const g of FACTS.guide) assert.doesNotMatch(`${g.title} ${g.fact}`, new RegExp(subject, 'i'), `${c.id} must not be in the guide`)
    } else {
      assert.ok(guideEntry(c.guide), `${c.id} points at a guide entry`)
    }
  }
})

test('the lesson has a surprising true fact and at least two made-up ones', () => {
  assert.ok(FACTS.claims.some((c) => c.id === 'octopus' && c.answer === 'backed'))
  assert.ok(FACTS.claims.filter((c) => c.answer !== 'backed').length >= 2)
  assert.ok(FACTS.claims.every((c) => FACTS.choices.some((ch) => ch.id === c.answer)))
})

test('every guide fact has a source', () => {
  for (const g of FACTS.guide) {
    assert.ok(g.source.length > 0, g.id)
    assert.match(g.url, /^https:\/\/[\w.-]+\.(gov|edu)\//, g.id)
  }
})

test('grading uses the key', () => {
  const key = Object.fromEntries(FACTS.claims.map((c) => [c.id, c.answer]))
  assert.ok(grade(key).every((r) => r.ok))
  assert.equal(grade({}).filter((r) => r.ok).length, 0)
})
