// Hands-on 3D demos. Each one runs the same real logic as its lesson.
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { BallCollider, CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { BACKPACK, WORLD } from '../content.ts'
import { add, CAPACITY, empty, type Item, type Pack } from '../lessons/backpack/logic.ts'
import { pick, seeded, type Guess } from '../lessons/guess/logic.ts'
import { countTokens, type Encoder } from '../lessons/tokens/logic.ts'
import { Board, Solid } from './parts.tsx'
import { glass, mat, sign, stripes } from './textures.ts'
import { ROOMS } from './layout.ts'

type V3 = [number, number, number]
const TUBE_COLORS = ['#ff7a59', '#5ef2e6', '#ffd166', '#7ddc8a', '#a78bfa']
const room = (id: string) => ROOMS.find((r) => r.id === id)!

// Next Word Machine: each ball is one guess, sampled from the model's real top 5 after "at the".
export function NextWordMachine({ active, top5 }: { active: boolean; top5: Guess[] | null }) {
  const r = room('guess')
  const origin: V3 = [(r.x0 + r.x1) / 2 - 0.5, 0, r.z0 + 0.95]
  const [balls, setBalls] = useState<{ id: number; tube: number; x: number; z: number }[]>([])
  const clock = useRef(0)
  const rand = useMemo(() => seeded(42), [])
  const next = useRef(0)
  const W = 0.75
  const x = (tube: number) => (tube - 2) * W
  const bodies = useRef(new Map<number, RapierRigidBody>())
  const drawn = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color() }), [])

  useFrame((_, dt) => {
    const inst = drawn.current
    if (inst) {
      balls.forEach((b, i) => {
        const t = bodies.current.get(b.id)?.translation()
        if (!t) return
        tmp.o.position.set(t.x - origin[0], t.y - origin[1], t.z - origin[2])
        tmp.o.updateMatrix()
        inst.setMatrixAt(i, tmp.o.matrix)
        inst.setColorAt(i, tmp.c.set(TUBE_COLORS[b.tube]))
      })
      inst.count = balls.length
      inst.instanceMatrix.needsUpdate = true
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true
    }
    if (!active || !top5) return
    clock.current += dt
    if (clock.current < 0.28) return
    clock.current = 0
    const word = pick(top5, 1, rand)
    const tube = top5.findIndex((g) => g.word === word)
    setBalls((b) => (b.length >= 120 ? [] : [...b, { id: next.current++, tube, x: x(tube) + (rand() - 0.5) * 0.3, z: (rand() - 0.5) * 0.3 }]))
  })

  const title = sign([{ t: WORLD.machineTitle, size: 64, bold: true, color: '#1d4f7a' }, { t: WORLD.machinePrompt, size: 50, bold: true, color: '#c2410c' }, { t: WORLD.machineHow, size: 34 }], { w: 1024, h: 560 })
  const frame = mat('#dfe7ec', { metal: 0.6, rough: 0.3 })
  return (
    <group position={origin}>
      <Solid p={[0, 0.3, 0]} s={[4.1, 0.6, 1.1]} m={mat('#1d4f7a', { rough: 0.4, metal: 0.3 })} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.9, 0.8, 0.03]} position={[0, 1.4, 0.33]} />
        <CuboidCollider args={[1.9, 0.8, 0.03]} position={[0, 1.4, -0.33]} />
        {[0, 1, 2, 3, 4, 5].map((i) => <CuboidCollider key={i} args={[0.025, 0.8, 0.33]} position={[(i - 2.5) * W, 1.4, 0]} />)}
      </RigidBody>
      <mesh position={[0, 1.4, -0.33]} material={mat('#f4f7f9', { rough: 0.6 })}><boxGeometry args={[3.8, 1.6, 0.05]} /></mesh>
      <mesh position={[0, 1.4, 0.33]} material={glass()}><boxGeometry args={[3.8, 1.6, 0.04]} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[(i - 2.5) * W, 1.4, 0]} material={frame}><boxGeometry args={[0.05, 1.6, 0.7]} /></mesh>)}
      <mesh position={[0, 2.25, 0]} material={frame}><boxGeometry args={[3.9, 0.1, 0.75]} /></mesh>
      {/* funnel on top */}
      <mesh position={[0, 2.55, 0]} material={mat('#ffd166', { metal: 0.4, rough: 0.4 })}><cylinderGeometry args={[0.9, 0.25, 0.5, 24, 1, true]} /></mesh>
      <Board p={[3.25, 1.75, -0.42]} w={2.4} h={1.31} tex={title} />
      {top5?.map((g, i) => (
        <Board key={g.word} p={[x(i), 0.32, 0.56]} w={0.72} h={0.4} tex={sign([{ t: g.word, size: 64, bold: true, color: TUBE_COLORS[i] }, { t: `${Math.round(g.p * 100)}%`, size: 52, bold: true, color: '#fff4e0' }], { w: 256, h: 150, bg: '#04182b', border: TUBE_COLORS[i] })} />
      ))}
      {/* the balls are invisible physics bodies; one instanced mesh draws them all */}
      {balls.map((b) => (
        <RigidBody key={b.id} colliders={false} position={[b.x, 2.45, b.z]} restitution={0.25} friction={0.5} ref={(body) => { if (body) bodies.current.set(b.id, body); else bodies.current.delete(b.id) }}>
          <BallCollider args={[0.1]} />
        </RigidBody>
      ))}
      <instancedMesh ref={drawn} args={[undefined, undefined, 120]} material={mat('#ffffff', { rough: 0.3, metal: 0.1 })} userData={{ dynamic: true }}>
        <sphereGeometry args={[0.1, 12, 8]} />
      </instancedMesh>
    </group>
  )
}

const ALL = [...BACKPACK.chat, { from: 'you', text: BACKPACK.question }]
const LEN = 5.4
const PER = LEN / CAPACITY

// Backpack belt: message blocks sized by their real token count, run through the lesson's own add().
// The oldest block ends up at the exit end and falls off when the backpack is over 60 tokens.
export function BackpackBelt({ active, enc }: { active: boolean; enc: Encoder | null }) {
  const r = room('backpack')
  const exitX = -LEN / 2
  const origin: V3 = [(r.x0 + r.x1) / 2, 0, r.z0 + 0.9]
  const [pack, setPack] = useState<Pack>(empty)
  const [fallen, setFallen] = useState<(Item & { x: number })[]>([])
  const count = useRef(0)
  const clock = useRef(1.5)
  const meshes = useRef(new Map<number, THREE.Mesh>())
  const placed = useRef(new Set<number>())

  const lay = (items: Item[]) => {
    let at = exitX
    return new Map(items.map((it) => {
      const len = it.tokens * PER
      const c = at + len / 2
      at += len
      return [it.id, c] as const
    }))
  }
  const targets = useMemo(() => lay(pack.items), [pack])

  useFrame((_, dt) => {
    for (const [id, m] of meshes.current) {
      const tx = targets.get(id)
      if (tx === undefined) continue
      m.position.x += (tx - m.position.x) * Math.min(1, dt * 4)
      m.position.y += (1.28 - m.position.y) * Math.min(1, dt * 5)
    }
    if (!active || !enc) return
    clock.current += dt
    if (clock.current < 1.8) return
    clock.current = 0
    const n = count.current++
    const text = ALL[n % ALL.length].text
    const next = add(pack, { id: n, text, tokens: countTokens(enc, text) })
    const gone = next.dropped.slice(pack.dropped.length)
    if (gone.length) setFallen((f) => [...f, ...gone.map((g) => ({ ...g, x: exitX - (g.tokens * PER) / 2 }))].slice(-10))
    setPack({ ...next, dropped: next.dropped.slice(-20) })
  })

  const title = sign([{ t: WORLD.beltTitle, size: 54, bold: true, color: '#1d4f7a' }, { t: WORLD.beltHow, size: 26 }], { w: 1024, h: 300 })
  const colorOf = (id: number) => (id % ALL.length === 0 ? '#ffd166' : ALL[id % ALL.length].from === 'you' ? '#ff7a59' : '#5ef2e6')
  const label = (it: Item) =>
    sign([{ t: it.id % ALL.length === 0 ? `${BACKPACK.answer} ${it.tokens}` : String(it.tokens), size: 72, bold: true }], { w: 256, h: 128, bg: colorOf(it.id), border: colorOf(it.id) })

  return (
    <group position={origin}>
      {/* stand, glass back and a short front lip; the exit end (-x) is open */}
      <Solid p={[0.15, 0.55, 0]} s={[LEN + 0.3, 1.1, 0.8]} m={mat('#f4f7f9', { rough: 0.5 })} />
      <mesh position={[0.15, 1.1, 0]} material={mat('#1d4f7a', { rough: 0.4 })}><boxGeometry args={[LEN + 0.35, 0.04, 0.85]} /></mesh>
      <mesh position={[0, 1.45, -0.32]} material={glass()}><boxGeometry args={[LEN, 0.7, 0.04]} /></mesh>
      <mesh position={[0, 1.3, 0.32]} material={glass()}><boxGeometry args={[LEN, 0.4, 0.04]} /></mesh>
      <mesh position={[LEN / 2 + 0.05, 1.45, 0]} material={mat('#1d4f7a')}><boxGeometry args={[0.08, 0.7, 0.68]} /></mesh>
      <mesh position={[exitX - 0.02, 1.13, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#ff5c8a', { glow: 0.8 })}><planeGeometry args={[0.06, 0.8]} /></mesh>
      <Board p={[0, 2.35, -0.36]} w={3.6} h={1.05} tex={title} />
      {pack.items.map((it) => (
        <mesh
          key={it.id}
          ref={(m) => {
            // new blocks drop in at the entry end; React calls this again on every render, so place each block once
            if (m) {
              if (!placed.current.has(it.id)) m.position.set(LEN / 2 - (it.tokens * PER) / 2, 2.1, 0)
              placed.current.add(it.id)
              meshes.current.set(it.id, m)
            } else meshes.current.delete(it.id)
          }}
          material={mat(colorOf(it.id), { rough: 0.5 })}
        >
          <boxGeometry args={[it.tokens * PER - 0.03, 0.34, 0.5]} />
          <mesh position={[0, 0, 0.26]} material={mat('#ffffff', { map: label(it) })}><planeGeometry args={[Math.min(0.6, it.tokens * PER - 0.08), 0.26]} /></mesh>
        </mesh>
      ))}
      {fallen.map((f) => (
        <RigidBody key={f.id} colliders="cuboid" position={[f.x, 1.3, 0]} linearVelocity={[-1.6, 0.5, 0]} angularVelocity={[0, 0, 2]}>
          <mesh material={mat(colorOf(f.id), { rough: 0.5 })}><boxGeometry args={[f.tokens * PER - 0.03, 0.34, 0.5]} /></mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// Beach balls in the lobby bin. Press F near one to kick it.
export function Balls({ kick }: { kick: MutableRefObject<(from: THREE.Vector3) => void> }) {
  const bodies = useRef<(RapierRigidBody | null)[]>([])
  const start: V3[] = [[7.8, 0.4, -4.8], [8.9, 0.4, -4.6], [8.3, 0.4, -3.8], [9.4, 0.4, -3.7], [7.5, 0.4, -3.8], [8.6, 1.1, -4.3]]
  useEffect(() => {
    kick.current = (from) => {
      for (const b of bodies.current) {
        if (!b) continue
        const p = b.translation()
        const d = new THREE.Vector3(p.x - from.x, 0, p.z - from.z)
        if (d.length() > 2.6) continue
        const m = b.mass()
        d.normalize().multiplyScalar(6 * m)
        b.applyImpulse({ x: d.x, y: 3 * m, z: d.z }, true)
      }
    }
  }, [kick])
  const tex = stripes('#ff7a59', '#fff4e0')
  const tex2 = stripes('#5ef2e6', '#fff4e0')
  return (
    <>
      {start.map((p, i) => (
        <RigidBody key={i} ref={(b) => { bodies.current[i] = b }} colliders="ball" position={p} restitution={0.7} linearDamping={0.35} angularDamping={0.4} density={0.25}>
          <mesh material={mat('#ffffff', { map: i % 2 ? tex : tex2, rough: 0.4 })}><sphereGeometry args={[0.35, 24, 16]} /></mesh>
        </RigidBody>
      ))}
    </>
  )
}
