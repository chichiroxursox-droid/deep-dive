// Themed furniture for each lab. Positions are room-local: x(v) is v meters toward the outer window
// (mirrored for rooms on the left), z is the same as the world. The camera always looks toward -z, so
// screens, signs and machine fronts sit on the far wall (z = -4) facing +z where a kid can see them.
// The strip from the door to the console (z between -1.3 and 1.3) stays clear.
import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances, RoundedBox } from '@react-three/drei'
import { WORLD, type LessonId } from '../content.ts'
import { Board, calm, Solid } from './parts.tsx'
import { chunkScreen, glass, mat, panels, sign } from './textures.ts'

type V3 = [number, number, number]
const NAVY = '#1d4f7a'
const WOOD = '#9a6b3f'
const BOOK_COLORS = ['#ff7a59', '#5ef2e6', '#ffd166', '#7ddc8a', '#ff5c8a', '#a78bfa', '#7fb3ff', '#f1ece2', '#1d4f7a']

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

// A wooden shelf full of books. Faces +z unless rotated.
function Bookshelf({ p, r = 0, seed = 1 }: { p: V3; r?: number; seed?: number }) {
  const books = useMemo(() => {
    const rand = rng(seed * 97 + 3)
    const out: { p: V3; s: V3; c: string }[] = []
    for (let shelf = 0; shelf < 4; shelf++) {
      let x = -0.9
      while (x < 0.85) {
        const w = 0.07 + rand() * 0.08
        const h = 0.3 + rand() * 0.14
        out.push({ p: [x + w / 2, 0.14 + shelf * 0.5 + h / 2, 0.02], s: [w * 0.92, h, 0.28], c: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)] })
        x += w
      }
    }
    return out
  }, [seed])
  const wood = mat(WOOD, { rough: 0.75 })
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Solid p={[0, 1.05, -0.17]} s={[2, 2.1, 0.06]} m={wood} />
      {[-1, 1].map((d) => <mesh key={d} position={[d, 1.05, 0]} material={wood}><boxGeometry args={[0.06, 2.1, 0.4]} /></mesh>)}
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[0, 0.1 + i * 0.5, 0]} material={wood}><boxGeometry args={[2, 0.05, 0.4]} /></mesh>)}
      <Instances limit={books.length} material={mat('#ffffff', { rough: 0.8 })}>
        <boxGeometry />
        {books.map((b, i) => <Instance key={i} position={b.p} scale={b.s} color={b.c} />)}
      </Instances>
    </group>
  )
}

function Plant({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Solid p={[0, 0.3, 0]} s={[0.55, 0.6, 0.55]} m={mat('#f1ece2', { rough: 0.9 })} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.05) * 0.14, 1.0, Math.sin(i * 1.05) * 0.14]} rotation={[Math.sin(i * 1.05) * 0.45, 0, -Math.cos(i * 1.05) * 0.45]} scale={[1, 4.2, 0.5]} material={mat(i % 2 ? '#3f8f5a' : '#57a86b', { rough: 0.8 })}>
          <sphereGeometry args={[0.12, 10, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function Table({ p, s = [1.6, 0.8, 0.9], top = WOOD }: { p: V3; s?: V3; top?: string }) {
  return (
    <group position={p}>
      <Solid p={[0, s[1] - 0.03, 0]} s={[s[0], 0.06, s[2]]} m={mat(top, { rough: 0.6 })} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => (
        <mesh key={`${a}${b}`} position={[(a * (s[0] - 0.12)) / 2, (s[1] - 0.06) / 2, (b * (s[2] - 0.12)) / 2]} material={mat(NAVY, { metal: 0.5, rough: 0.4 })}>
          <boxGeometry args={[0.06, s[1] - 0.06, 0.06]} />
        </mesh>
      ))}
    </group>
  )
}

function Spinner({ p, children, speed = 1.5 }: { p: V3; children: ReactNode; speed?: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!calm && g.current) g.current.rotation.y += dt * speed
  })
  return <group ref={g} position={p} userData={{ dynamic: true }}>{children}</group>
}

function Tokens({ x, strawberry }: { x: (v: number) => number; strawberry: string[] | null }) {
  const screen = strawberry ? chunkScreen(WORLD.tokenScreen, strawberry) : sign([{ t: WORLD.tokenScreen, size: 40, bold: true, color: '#5ef2e6' }], { bg: '#04182b', border: '#04182b' })
  const blocks: [string, V3][] = [['#ff7a59', [-1, 0.95, 0]], ['#5ef2e6', [-0.4, 0.95, 0.1]], ['#ffd166', [0.3, 0.95, -0.1]], ['#7ddc8a', [0.9, 0.95, 0.1]], ['#ff5c8a', [-0.7, 1.35, 0]], ['#a78bfa', [0.6, 1.35, 0]], ['#ff7a59', [0, 1.7, 0]]]
  return (
    <>
      {/* reef tank full of token-block coral */}
      <group position={[x(1.4), 0, -3.3]}>
        <Solid p={[0, 0.35, 0]} s={[3.2, 0.7, 1]} m={mat(NAVY, { rough: 0.5, metal: 0.3 })} />
        <mesh position={[0, 0.76, 0]} material={mat('#e6d3a3', { rough: 1 })}><boxGeometry args={[3.1, 0.12, 0.9]} /></mesh>
        {blocks.map(([c, bp], i) => <RoundedBox key={i} args={[0.36, 0.36, 0.36]} radius={0.07} position={bp} rotation={[0, i * 0.5, 0]} material={mat(c, { rough: 0.5, glow: 0.25 })} />)}
        <mesh position={[0, 1.35, 0]} material={mat('#5ec8f2', { rough: 0.1, opacity: 0.22 })}><boxGeometry args={[3.1, 1.2, 0.9]} /></mesh>
        <mesh position={[0, 1.35, 0]} material={glass()}><boxGeometry args={[3.2, 1.3, 1]} /></mesh>
      </group>
      <Board p={[x(-2.5), 1.75, -3.86]} w={3.2} h={1.6} tex={screen} dynamic />
      {[['#ff7a59', -3.4], ['#5ef2e6', -2.4]].map(([c, v]) => (
        <mesh key={c} position={[x(Number(v)), 0.3, 2.7]} scale={[1, 0.6, 1]} material={mat(c as string, { rough: 0.95 })}><sphereGeometry args={[0.5, 20, 14]} /></mesh>
      ))}
      <Plant p={[x(5), 0, 3.3]} />
    </>
  )
}

function Guess({ x }: { x: (v: number) => number }) {
  return (
    <>
      <Table p={[x(3.6), 0, 3.0]} />
      <group position={[x(3.6), 0.8, 3.0]}>
        {[0, 1, 2].map((i) => <mesh key={i} position={[-0.4, 0.05 + i * 0.09, 0]} rotation={[0, i * 0.3, 0]} material={mat(BOOK_COLORS[i], { rough: 0.8 })}><boxGeometry args={[0.5, 0.08, 0.35]} /></mesh>)}
        {/* temperature dial */}
        <mesh position={[0.35, 0.3, 0]} material={mat('#dfe7ec', { metal: 0.5, rough: 0.3 })}><cylinderGeometry args={[0.28, 0.3, 0.1, 24]} /></mesh>
        <mesh position={[0.35, 0.36, 0]} rotation={[0, 0.8, 0]} material={mat('#ff5c8a', { glow: 0.5 })}><boxGeometry args={[0.04, 0.03, 0.26]} /></mesh>
      </group>
      <Plant p={[x(5), 0, -3.3]} />
      <Plant p={[x(-4.8), 0, 3.3]} />
    </>
  )
}

function Backpack({ x }: { x: (v: number) => number }) {
  return (
    <>
      <group position={[x(4.3), 0, 3.0]} rotation={[0, x(-0.4), 0]}>
        <RoundedBox args={[1.5, 1.9, 1]} radius={0.35} position={[0, 0.95, 0]} material={mat('#ff7a59', { rough: 0.8 })} />
        <RoundedBox args={[1.1, 0.8, 0.35]} radius={0.15} position={[0, 0.6, 0.55]} material={mat('#ffd166', { rough: 0.8 })} />
        <mesh position={[0, 1.95, 0]} material={mat('#ffd166', { rough: 0.8 })}><torusGeometry args={[0.35, 0.07, 10, 24, Math.PI]} /></mesh>
      </group>
      <Solid p={[x(-3), 0.25, 3.3]} s={[2.4, 0.5, 0.8]} m={mat('#3d6f96', { rough: 0.95 })} />
      <Plant p={[x(5), 0, -3.3]} />
    </>
  )
}

function Chef({ x }: { x: (v: number) => number }) {
  const recipe = sign([{ t: WORLD.kitchen, size: 34, bold: true, color: NAVY }], { w: 768, h: 220 })
  return (
    <>
      <Solid p={[x(-0.8), 0.47, -3.4]} s={[5, 0.94, 0.9]} m={mat('#f4f7f9', { rough: 0.5 })}>
        <mesh position={[0, 0.49, 0]} material={mat('#2b3a4a', { rough: 0.3, metal: 0.2 })}><boxGeometry args={[5.1, 0.05, 0.95]} /></mesh>
      </Solid>
      {/* stove, pot and chef hat on the counter */}
      {[-1.8, -1.1].map((v) => <mesh key={v} position={[x(v), 0.975, -3.4]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#ff5c3a', { glow: 0.8 })}><ringGeometry args={[0.14, 0.24, 24]} /></mesh>)}
      <mesh position={[x(-1.8), 1.15, -3.4]} material={mat('#c8d6de', { metal: 0.8, rough: 0.25 })}><cylinderGeometry args={[0.26, 0.24, 0.35, 24]} /></mesh>
      <mesh position={[x(0.6), 1.1, -3.3]} material={mat('#ffffff', { rough: 0.9 })}><cylinderGeometry args={[0.18, 0.2, 0.25, 16]} /></mesh>
      {[-0.1, 0.1].map((v) => <mesh key={v} position={[x(0.6 + v), 1.3, -3.3]} material={mat('#ffffff', { rough: 0.9 })}><sphereGeometry args={[0.16, 14, 10]} /></mesh>)}
      <Solid p={[x(3.9), 1, -3.3]} s={[1, 2, 0.9]} m={mat('#dfe7ec', { metal: 0.6, rough: 0.3 })}>
        <mesh position={[x(-0.35), 0.1, 0.46]} material={mat(NAVY)}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
      </Solid>
      <Board p={[x(-0.8), 2.05, -3.86]} w={3.4} h={0.98} tex={recipe} />
      <Table p={[x(-2.8), 0, 2.9]} s={[1.4, 0.75, 1.4]} top="#f4f7f9" />
      <Plant p={[x(5), 0, 3.3]} />
    </>
  )
}

function FactCheck({ x }: { x: (v: number) => number }) {
  const poster = sign([{ t: WORLD.guide, size: 56, bold: true, color: NAVY }, { t: 'NOAA', size: 30, color: '#1d5580' }], { w: 512, h: 300 })
  return (
    <>
      <Bookshelf p={[x(-3), 0, -3.55]} seed={5} />
      <Bookshelf p={[x(-0.6), 0, -3.55]} seed={6} />
      <Table p={[x(3.6), 0, 2.9]} />
      <group position={[x(3.6), 0.83, 2.9]}>
        {[-1, 1].map((d) => <mesh key={d} position={[d * 0.2, 0.02, 0]} rotation={[0, 0, d * -0.12]} material={mat('#fff4e0', { rough: 0.9 })}><boxGeometry args={[0.4, 0.02, 0.5]} /></mesh>)}
        <mesh position={[0.5, 0.15, 0.1]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#5ef2e6', { glow: 0.4, metal: 0.4 })}><torusGeometry args={[0.13, 0.025, 8, 24]} /></mesh>
      </group>
      <Board p={[x(2.6), 1.8, -3.86]} w={2} h={1.17} tex={poster} />
      <group position={[x(4.8), 0, -3.1]}>
        <Solid p={[0, 0.5, 0]} s={[0.12, 1, 0.12]} m={mat(WOOD)} />
        <mesh position={[0, 1.25, 0]} material={mat('#5aa9e6', { rough: 0.5 })}><sphereGeometry args={[0.35, 24, 16]} /></mesh>
      </group>
    </>
  )
}

function Toolbox({ x }: { x: (v: number) => number }) {
  const keys = useMemo(() => Array.from({ length: 12 }, (_, i) => [((i % 3) - 1) * 0.1, Math.floor(i / 3) * 0.08] as const), [])
  return (
    <>
      <Table p={[x(-0.5), 0, -3.35]} s={[4, 0.95, 0.9]} />
      {/* big calculator on the bench */}
      <group position={[x(-1.6), 0.97, -3.3]} rotation={[-0.3, 0, 0]}>
        <mesh material={mat('#2b3a4a', { rough: 0.5 })}><boxGeometry args={[0.45, 0.06, 0.6]} /></mesh>
        <mesh position={[0, 0.035, -0.2]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#7ddc8a', { glow: 0.6 })}><planeGeometry args={[0.35, 0.12]} /></mesh>
        {keys.map(([kx, kz], i) => <mesh key={i} position={[kx, 0.04, kz - 0.05]} material={mat(i % 3 === 2 ? '#ff7a59' : '#dfe7ec')}><boxGeometry args={[0.07, 0.03, 0.05]} /></mesh>)}
      </group>
      <mesh position={[x(0.3), 1.02, -3.3]} rotation={[0, 0.4, Math.PI / 2]} material={mat('#c8d6de', { metal: 0.8, rough: 0.3 })}><cylinderGeometry args={[0.04, 0.04, 0.6, 10]} /></mesh>
      <mesh position={[x(0.9), 1.0, -3.25]} material={mat('#a78bfa', { rough: 0.6 })}><boxGeometry args={[0.6, 0.12, 0.35]} /></mesh>
      {/* tool wall */}
      <mesh position={[x(-0.5), 1.9, -3.86]} material={mat('#c9a87c', { map: panels('#c9a87c', [6, 3]), rough: 0.9 })}><boxGeometry args={[3.6, 1.3, 0.04]} /></mesh>
      {[-1.8, -1.1, -0.4, 0.3, 1].map((v, i) => (
        <mesh key={v} position={[x(v), 1.9, -3.8]} rotation={[0, 0, i * 0.5]} material={mat(['#ff7a59', '#5ef2e6', '#ffd166', '#7ddc8a', '#a78bfa'][i], { metal: 0.3, rough: 0.5 })}>
          <boxGeometry args={[0.12, 0.8, 0.06]} />
        </mesh>
      ))}
      {/* weather station with spinning cups */}
      <group position={[x(4.8), 0, 3.1]}>
        <Solid p={[0, 1.1, 0]} s={[0.1, 2.2, 0.1]} m={mat('#dfe7ec', { metal: 0.7, rough: 0.3 })} />
        <Spinner p={[0, 2.25, 0]} speed={3}>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
              <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mat('#dfe7ec')}><cylinderGeometry args={[0.015, 0.015, 0.6, 6]} /></mesh>
              <mesh position={[0.6, 0, 0]} material={mat('#ff7a59')}><sphereGeometry args={[0.09, 12, 8, 0, Math.PI]} /></mesh>
            </group>
          ))}
        </Spinner>
      </group>
      <RoundedBox args={[1.2, 0.7, 0.6]} radius={0.08} position={[x(-3.4), 0.35, 3.2]} material={mat('#a78bfa', { rough: 0.5 })} />
    </>
  )
}

function Library({ x }: { x: (v: number) => number }) {
  return (
    <>
      <Bookshelf p={[x(-3.2), 0, -3.55]} seed={13} />
      <Bookshelf p={[x(-0.6), 0, -3.55]} seed={14} />
      <Bookshelf p={[x(1.9), 0, -3.55]} seed={15} />
      <Bookshelf p={[x(-3.2), 0, 3.55]} r={Math.PI} seed={11} />
      {[[3.9, -2.4], [4.6, 2.7]].map(([v, z]) => (
        <group key={v} position={[x(v), 0, z]} rotation={[0, z < 0 ? 0 : Math.PI, 0]}>
          <Solid p={[0, 0.25, 0]} s={[0.9, 0.5, 0.85]} m={mat('#b04a3a', { rough: 0.9 })} />
          <mesh position={[0, 0.7, -0.35]} material={mat('#b04a3a', { rough: 0.9 })}><boxGeometry args={[0.9, 0.6, 0.18]} /></mesh>
        </group>
      ))}
      <group position={[x(5.1), 0, -3.4]}>
        <Solid p={[0, 0.8, 0]} s={[0.06, 1.6, 0.06]} m={mat('#2b3a4a')} />
        <mesh position={[0, 1.65, 0]} material={mat('#fff1c7', { glow: 1.6 })}><coneGeometry args={[0.28, 0.3, 20, 1, true]} /></mesh>
      </group>
    </>
  )
}

function Harbor({ x }: { x: (v: number) => number }) {
  return (
    <>
      <group position={[x(4.3), 0, 3.0]} scale={1.3}>
        <Solid p={[0, 1.2, 0]} s={[0.8, 2.4, 0.8]} m={mat('#fff4e0')} />
        <mesh position={[0, 0.9, 0]} material={mat('#ff5c8a')}><cylinderGeometry args={[0.62, 0.62, 0.35, 20]} /></mesh>
        <mesh position={[0, 2.65, 0]} material={mat('#ffd166', { glow: 1.5 })}><cylinderGeometry args={[0.38, 0.38, 0.5, 16]} /></mesh>
        <mesh position={[0, 3.05, 0]} material={mat('#ff5c8a')}><coneGeometry args={[0.5, 0.45, 16]} /></mesh>
      </group>
      {[-3.6, -2.6, -1.6, -0.6].map((v, i) => (
        <Solid key={v} p={[x(v), 1, -3.5]} s={[0.9, 2, 0.7]} m={mat(['#7fb3ff', '#5ef2e6', '#7fb3ff', '#5ef2e6'][i], { map: panels('#e9f3fb', [1, 2]), rough: 0.5, metal: 0.2 })} />
      ))}
      <group position={[x(4.4), 0, -3.2]}>
        <Solid p={[0, 0.5, 0]} s={[1, 1, 0.9]} m={mat('#4a5563', { metal: 0.6, rough: 0.35 })} />
        <mesh position={[0, 0.6, 0.46]} material={mat('#e8b04a', { metal: 0.8, rough: 0.2 })}><torusGeometry args={[0.16, 0.035, 8, 24]} /></mesh>
      </group>
      {[0, 1].map((i) => (
        <mesh key={i} position={[x(2.2), 1.8, -3.82]} rotation={[0, 0, i * Math.PI]} material={mat(i ? '#ff5c8a' : '#ffffff', { rough: 0.6 })}>
          <torusGeometry args={[0.45, 0.13, 12, 24, Math.PI]} />
        </mesh>
      ))}
    </>
  )
}

export function RoomProps({ id, side, strawberry }: { id: LessonId; side: -1 | 1; strawberry: string[] | null }) {
  const x = (v: number) => v * side
  switch (id) {
    case 'tokens': return <Tokens x={x} strawberry={strawberry} />
    case 'guess': return <Guess x={x} />
    case 'backpack': return <Backpack x={x} />
    case 'chef': return <Chef x={x} />
    case 'factcheck': return <FactCheck x={x} />
    case 'toolbox': return <Toolbox x={x} />
    case 'library': return <Library x={x} />
    case 'harbor': return <Harbor x={x} />
  }
}
