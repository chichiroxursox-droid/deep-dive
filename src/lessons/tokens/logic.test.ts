import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countTokens, loadEncoder, split } from './logic.ts'

const SAMPLES = ['strawberry', 'jellyfish', 'The ocean is deep.', 'Maya', 'Pip \u{1F419} swims!']

test('splits of 5 fixed strings match the snapshot from the real tokenizer', async (t) => {
  const enc = await loadEncoder()
  t.assert.snapshot(SAMPLES.map((s) => split(enc, s).map((p) => p.text)))
})

test('a real \uFFFD in the text does not swallow the rest', async () => {
  const enc = await loadEncoder()
  const text = 'a \uFFFD then many more words after it'
  const pieces = split(enc, text)
  assert.equal(pieces.map((p) => p.text).join(''), text)
  assert.ok(pieces.slice(-6).every((p) => p.ids.length === 1), 'words after the \uFFFD are their own tokens')
})

test('pieces glue back into the original text, one id per token', async () => {
  const enc = await loadEncoder()
  for (const s of SAMPLES) {
    const pieces = split(enc, s)
    assert.equal(pieces.map((p) => p.text).join(''), s)
    assert.equal(pieces.flatMap((p) => p.ids).length, countTokens(enc, s))
  }
})
