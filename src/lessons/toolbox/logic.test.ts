import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TOOLBOX as T } from '../../content.ts'
import { answer, judge, rightTool, snackTotal } from './logic.ts'

test('task-to-tool map', () => {
  assert.deepEqual(Object.fromEntries(T.jobs.map((j) => [j.id, rightTool(j.id)])), { math: 'calc', weather: 'weather', report: 'skill', joke: 'none' })
})

test('every job has an answer for every tool, right only for its tool', () => {
  for (const j of T.jobs) for (const t of T.tools) {
    const a = answer(j.id, t.id)
    assert.ok(a.text.length > 0, `${j.id}/${t.id}`)
    assert.equal(a.right, t.id === j.tool)
  }
})

test('the calculator really multiplies, and the no-tool guess is wrong', () => {
  assert.match(answer('math', 'calc').text, /^130,653\./)
  assert.doesNotMatch(answer('math', 'none').text, /130,653/)
})

test('agent mode: approve the tool steps, deny sending', () => {
  assert.ok(judge([true, true, true, false]).every(Boolean))
  assert.equal(judge([true, true, true, true])[3], false)
  assert.equal(snackTotal(), 12)
})
