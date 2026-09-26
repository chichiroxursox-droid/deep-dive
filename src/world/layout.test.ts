import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LESSONS } from '../content.ts'
import { areaAt, CORRIDOR, DECK, LICENSE_POS, LOBBY, ROOMS, segments, SPAWN, walls } from './layout.ts'

test('every lab has its own room, with its console inside it', () => {
  assert.deepEqual(ROOMS.map((r) => r.id), LESSONS.map((l) => l.id))
  for (const r of ROOMS) assert.equal(areaAt(...r.console), r.id)
})

test('rooms never overlap and every door opens onto the corridor', () => {
  for (const a of ROOMS) for (const b of ROOMS) {
    if (a === b) continue
    const overlap = a.x0 < b.x1 && b.x0 < a.x1 && a.z0 < b.z1 && b.z0 < a.z1
    assert.equal(overlap, false, `${a.id} overlaps ${b.id}`)
  }
  for (const r of ROOMS) {
    assert.ok(r.doorZ > CORRIDOR.z0 && r.doorZ < CORRIDOR.z1, r.id)
    assert.equal(r.side < 0 ? r.x1 : r.x0, r.side < 0 ? CORRIDOR.x0 : CORRIDOR.x1, `${r.id} touches the corridor`)
  }
})

test('the walk goes sea floor, lobby, corridor, deck', () => {
  assert.equal(areaAt(SPAWN[0], SPAWN[2]), 'sea')
  assert.equal(areaAt(0, (LOBBY.z0 + LOBBY.z1) / 2), 'lobby')
  assert.equal(areaAt(0, (CORRIDOR.z0 + CORRIDOR.z1) / 2), 'corridor')
  assert.equal(areaAt(...LICENSE_POS), 'deck')
  assert.equal(DECK.z1, CORRIDOR.z0)
})

test('every room door is a real gap in the corridor wall', () => {
  const ws = walls()
  for (const r of ROOMS) {
    const wall = ws.find((w) => w.a[0] === (r.side < 0 ? CORRIDOR.x0 : CORRIDOR.x1) && w.b[0] === w.a[0])!
    const segs = segments(wall)
    assert.ok(segs.every(([a, b]) => b <= r.doorZ - 1 || a >= r.doorZ + 1), `${r.id} door is open`)
  }
})
