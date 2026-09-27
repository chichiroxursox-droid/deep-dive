import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { CuboidCollider, RigidBody, type IntersectionEnterPayload } from '@react-three/rapier'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Board, calm, Solid, StaticBatch } from './parts.tsx'
import { LESSONS, LICENSE, UI, WORLD, type LessonId } from '../content.ts'
import { CORRIDOR, DECK, DOOR_W, LICENSE_POS, LOBBY, OUTER_X, ROOMS, segments, WALL_H, walls, type Room, type WallDef } from './layout.ts'
import { glass, mat, panels, sign, tiles } from './textures.ts'
import { RoomProps } from './Rooms.tsx'

type V3 = [number, number, number]
const T = 0.25
const NAVY = '#1d4f7a'
const WHITE = '#eef3f6'
const tint = (c: string, k: number) => '#' + new THREE.Color('#ffffff').lerp(new THREE.Color(c), k).getHexString()


// One wall from the layout: solid panels, or glass with a sill, header and posts. Door gaps get a colored frame.
function Wall({ w }: { w: WallDef }) {
  const alongX = w.a[1] === w.b[1]
  const fixed = alongX ? w.a[1] : w.a[0]
  const at = (c: number, y: number): V3 => (alongX ? [c, y, fixed] : [fixed, y, c])
  const size = (len: number, h: number, t = T): V3 => (alongX ? [len, h, t] : [t, h, len])
  const wallMat = (len: number) => mat(WHITE, { map: panels('#f4f7f9', [Math.max(1, Math.round(len / 1.5)), 2]), rough: 0.85 })
  return (
    <RigidBody type="fixed" colliders={false}>
      {segments(w).map(([s0, s1]) => {
        const len = s1 - s0
        const c = (s0 + s1) / 2
        const posts = w.glassy ? Math.max(1, Math.round(len / 2.6)) : 0
        return (
          <group key={s0}>
            <CuboidCollider args={size(len / 2, WALL_H / 2, T / 2)} position={at(c, WALL_H / 2)} />
            {w.glassy ? (
              <>
                <mesh position={at(c, 0.45)} material={mat(NAVY, { rough: 0.5, metal: 0.3 })}><boxGeometry args={size(len, 0.9)} /></mesh>
                <mesh position={at(c, WALL_H - 0.2)} material={mat(NAVY, { rough: 0.5, metal: 0.3 })}><boxGeometry args={size(len, 0.4)} /></mesh>
                <mesh position={at(c, (WALL_H + 0.5) / 2)} material={glass()}><boxGeometry args={size(len, WALL_H - 1.3, 0.05)} /></mesh>
                {Array.from({ length: posts + 1 }, (_, i) => (
                  <mesh key={i} position={at(s0 + (len * i) / posts, WALL_H / 2)} material={mat('#dfe7ec', { rough: 0.4, metal: 0.5 })}>
                    <boxGeometry args={size(0.12, WALL_H, 0.3)} />
                  </mesh>
                ))}
              </>
            ) : (
              <>
                <mesh position={at(c, WALL_H / 2)} material={wallMat(len)}><boxGeometry args={size(len, WALL_H)} /></mesh>
                <mesh position={at(c, 0.08)} material={mat(NAVY)}><boxGeometry args={size(len, 0.16, T + 0.04)} /></mesh>
              </>
            )}
          </group>
        )
      })}
      {(w.gaps ?? []).filter((g) => g.color).map((g) => (
        <group key={`door${g.at}`}>
          {[-1, 1].map((d) => (
            <mesh key={d} position={at(g.at + d * (g.w / 2 + 0.06), WALL_H / 2)} material={mat(g.color!, { rough: 0.4, glow: 0.15 })}>
              <boxGeometry args={size(0.14, WALL_H, T + 0.1)} />
            </mesh>
          ))}
          <mesh position={at(g.at, WALL_H - 0.45)} material={mat(g.color!, { rough: 0.4, glow: 0.15 })}><boxGeometry args={size(g.w + 0.26, 0.9, T + 0.1)} /></mesh>
        </group>
      ))}
    </RigidBody>
  )
}

function Floor({ r, color, y = 0.03 }: { r: { x0: number; x1: number; z0: number; z1: number }; color: string; y?: number }) {
  const w = r.x1 - r.x0
  const d = r.z1 - r.z0
  return (
    <mesh position={[(r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#ffffff', { map: tiles(color, [w / 1.2, d / 1.2]), rough: 0.55 })} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  )
}


// Ceiling boards over every room, with a glass skylight down the corridor that shows the water above.
const CEILINGS = [LOBBY, DECK, ...ROOMS, { x0: CORRIDOR.x0, x1: -1, z0: CORRIDOR.z0, z1: CORRIDOR.z1 }, { x0: 1, x1: CORRIDOR.x1, z0: CORRIDOR.z0, z1: CORRIDOR.z1 }]
const SKY = { x0: -1, x1: 1, z0: CORRIDOR.z0, z1: CORRIDOR.z1 }
const box = (r: { x0: number; x1: number; z0: number; z1: number }, y: number, h: number) => ({ p: [(r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2] as V3, s: [r.x1 - r.x0, h, r.z1 - r.z0] as V3 })

// One invisible mesh of every solid wall and ceiling, so the camera slides in front of them instead of through.
// Glass walls are left out: you can see through them, so the camera may sit behind one like a window.
export function cameraBlockers() {
  const parts: THREE.BufferGeometry[] = []
  const add = (p: V3, sz: V3) => parts.push(new THREE.BoxGeometry(...sz).translate(...p))
  for (const w of walls().filter((w) => !w.glassy)) {
    const alongX = w.a[1] === w.b[1]
    for (const [s0, s1] of segments(w)) {
      const c = (s0 + s1) / 2
      add(alongX ? [c, WALL_H / 2, w.a[1]] : [w.a[0], WALL_H / 2, c], alongX ? [s1 - s0, WALL_H, 0.4] : [0.4, WALL_H, s1 - s0])
    }
  }
  for (const r of [...CEILINGS, SKY]) {
    const b = box(r, WALL_H + 0.05, 0.1)
    add(b.p, b.s)
  }
  const mesh = new THREE.Mesh(mergeGeometries(parts))
  mesh.updateMatrixWorld()
  return mesh
}

function Ceiling() {
  const board = mat('#f5f8fa', { rough: 0.92, glow: 0.45 })
  const lamp = mat('#fff6df', { glow: 1.3 })
  const lamps: V3[] = [
    ...ROOMS.flatMap((r): V3[] => [[(r.x0 + r.x1) / 2 - 2, WALL_H - 0.01, (r.z0 + r.z1) / 2], [(r.x0 + r.x1) / 2 + 2, WALL_H - 0.01, (r.z0 + r.z1) / 2]]),
    ...[-9, -3, 3, 9].flatMap((x): V3[] => [[x, WALL_H - 0.01, -2.5], [x, WALL_H - 0.01, -5.5]]),
    [-3, WALL_H - 0.01, (DECK.z0 + DECK.z1) / 2],
    [3, WALL_H - 0.01, (DECK.z0 + DECK.z1) / 2],
  ]
  const beams: V3[] = []
  for (let z = CORRIDOR.z1 - 1; z > CORRIDOR.z0; z -= 2) beams.push([0, WALL_H + 0.02, z])
  return (
    <group>
      {CEILINGS.map((r, i) => {
        const b = box(r, WALL_H + 0.05, 0.1)
        return <mesh key={i} position={b.p} material={board} userData={{ noShadow: true }}><boxGeometry args={b.s} /></mesh>
      })}
      <mesh position={box(SKY, WALL_H + 0.1, 0.04).p} material={glass()}><boxGeometry args={box(SKY, 0, 0.04).s} /></mesh>
      {beams.map((p, i) => <mesh key={i} position={p} material={mat('#dfe7ec', { metal: 0.6, rough: 0.3 })} userData={{ noShadow: true }}><boxGeometry args={[2.1, 0.14, 0.14]} /></mesh>)}
      {lamps.map((p, i) => <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]} material={lamp}><planeGeometry args={[1.4, 0.9]} /></mesh>)}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, WALL_H - 0.01, (CORRIDOR.z0 + CORRIDOR.z1) / 2]} rotation={[Math.PI / 2, 0, 0]} material={lamp}>
          <planeGeometry args={[0.12, CORRIDOR.z1 - CORRIDOR.z0 - 1]} />
        </mesh>
      ))}
    </group>
  )
}

// ecctrl names the diver's capsule collider this.
const isDiver = (e: IntersectionEnterPayload) => e.other.colliderObject?.name === 'character-capsule-collider'

// The glowing console in every lab: walk up and press E.
export function Console({ p, r, color, lines, onEnter, onLeave }: { p: V3; r: number; color: string; lines: string[]; onEnter: () => void; onLeave: () => void }) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!calm && ring.current) (ring.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 + Math.sin(clock.elapsedTime * 2.5) * 0.5
  })
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1 }), [color])
  const tex = sign([{ t: lines[0], size: 44, color, bold: true }, { t: lines[1], size: 64, color: '#fff4e0', bold: true }, { t: lines[2], size: 46, color: '#5ef2e6', bold: true }], { bg: '#04182b', border: color, w: 512, h: 320 })
  return (
    <group position={p} rotation={[0, r, 0]}>
      <mesh ref={ring} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ringMat} userData={{ dynamic: true }}>
        <ringGeometry args={[1.0, 1.25, 48]} />
      </mesh>
      <Solid p={[0, 0.5, 0]} s={[0.8, 1, 0.8]} m={mat(NAVY, { rough: 0.4, metal: 0.4 })} />
      <group position={[0, 1.2, 0]} rotation={[-0.55, 0, 0]}>
        <mesh material={mat('#dfe7ec', { rough: 0.3, metal: 0.6 })}><boxGeometry args={[1.3, 0.85, 0.1]} /></mesh>
        <mesh position={[0, 0, 0.056]} material={mat('#ffffff', { map: tex, glow: 0 })} userData={{ dynamic: true }}><planeGeometry args={[1.2, 0.75]} /></mesh>
      </group>
      <RigidBody type="fixed" colliders={false}>
        {/* only the diver counts: a rolling beach ball shouldn't light up a console */}
        <CuboidCollider sensor args={[1.9, 1.5, 1.9]} position={[0, 1.5, 0.4]} onIntersectionEnter={(e) => isDiver(e) && onEnter()} onIntersectionExit={(e) => isDiver(e) && onLeave()} />
      </RigidBody>
    </group>
  )
}

function Pip3D({ p }: { p: V3 }) {
  const body = useRef<THREE.Group>(null)
  const [tip, setTip] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTip((n) => (n + 1) % WORLD.pipTips.length), 5000)
    return () => clearInterval(t)
  }, [])
  useFrame(({ clock }) => {
    if (!calm && body.current) body.current.position.y = 0.25 + Math.sin(clock.elapsedTime * 1.6) * 0.08
  })
  const bubble = sign([{ t: WORLD.pipTips[tip], size: 40, bold: true }], { w: 512, h: 190, border: '#5ef2e6' })
  const cyan = mat('#5ef2e6', { rough: 0.35, metal: 0.1 })
  return (
    <group position={p} userData={{ dynamic: true }}>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#5ef2e6', { glow: 0.8 })}><ringGeometry args={[0.35, 0.5, 32]} /></mesh>
      <group ref={body} position={[0, 0.25, 0]} rotation={[0, 0.5, 0]}>
        <RoundedBox args={[0.9, 1, 0.7]} radius={0.25} position={[0, 0.7, 0]} material={cyan} />
        <RoundedBox args={[0.68, 0.42, 0.08]} radius={0.12} position={[0, 0.78, 0.33]} material={mat('#04182b', { rough: 0.2 })} />
        {[-0.15, 0.15].map((x) => <mesh key={x} position={[x, 0.8, 0.38]} material={mat('#5ef2e6', { glow: 2 })}><sphereGeometry args={[0.06, 16, 12]} /></mesh>)}
        <mesh position={[0, 1.35, 0]} material={mat('#ffd166', { metal: 0.5 })}><cylinderGeometry args={[0.03, 0.03, 0.3, 8]} /></mesh>
        <mesh position={[0, 1.52, 0]} material={mat('#ff7a59', { glow: 0.8 })}><sphereGeometry args={[0.09, 16, 12]} /></mesh>
        {[-0.55, 0.55].map((x) => <mesh key={x} position={[x, 0.6, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]} material={cyan}><capsuleGeometry args={[0.09, 0.35, 4, 8]} /></mesh>)}
      </group>
      <Billboard position={[0, 2.35, 0]}>
        <mesh material={mat('#ffffff', { map: bubble })}><planeGeometry args={[2.4, 0.9]} /></mesh>
      </Billboard>
    </group>
  )
}

function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Solid p={[0, 0.3, 0]} s={[0.6, 0.6, 0.6]} m={mat('#f1ece2', { rough: 0.9 })} />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`l${i}`} position={[Math.cos(i * 1.26) * 0.15, 1.05, Math.sin(i * 1.26) * 0.15]} rotation={[Math.sin(i * 1.26) * 0.4, 0, -Math.cos(i * 1.26) * 0.4]} scale={[1, 4, 0.5]} material={mat(i % 2 ? '#3f8f5a' : '#57a86b', { rough: 0.8 })}>
          <sphereGeometry args={[0.13, 10, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function Lobby() {
  const left = ROOMS.filter((r) => r.side < 0).map((r) => `${r.num}. ${LESSONS.find((l) => l.id === r.id)!.title}`).join('   ')
  const right = ROOMS.filter((r) => r.side > 0).map((r) => `${r.num}. ${LESSONS.find((l) => l.id === r.id)!.title}`).join('   ')
  const map = sign(
    [
      { t: WORLD.mapTitle, size: 44, bold: true, color: NAVY },
      { t: `${WORLD.mapLeft}: ${left}`, size: 26 },
      { t: `${WORLD.mapRight}: ${right}`, size: 26 },
      { t: `${LICENSE.title}: ${WORLD.areas.deck[0]}`, size: 26, color: '#c2410c' },
    ],
    { w: 1024, h: 460 },
  )
  const white = mat(WHITE, { rough: 0.6 })
  return (
    <group>
      {/* reception desk with Pip behind it */}
      <Solid p={[-7, 0.52, -4.4]} s={[3.4, 1.04, 0.9]} m={white}>
        <mesh position={[0, 0.54, 0]} material={mat(NAVY, { rough: 0.3, metal: 0.3 })}><boxGeometry args={[3.6, 0.06, 1.05]} /></mesh>
        <mesh position={[0, 0.1, 0.46]} material={mat('#ff7a59', { glow: 0.3 })}><boxGeometry args={[3.4, 0.08, 0.02]} /></mesh>
      </Solid>
      <Pip3D p={[-7, 0, -5.7]} />
      <Board p={[7.5, 1.75, LOBBY.z0 + 0.14]} w={4.4} h={2} tex={map} />
      {/* round rug */}
      <mesh position={[0, 0.045, -3.6]} rotation={[-Math.PI / 2, 0, 0]} material={mat(NAVY, { rough: 1 })}><circleGeometry args={[2.6, 48]} /></mesh>
      <mesh position={[0, 0.05, -3.6]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#5ef2e6', { rough: 1, glow: 0.2 })}><ringGeometry args={[2.1, 2.25, 48]} /></mesh>
      {/* sofas by the front windows */}
      {[-9.5, 9.5].map((x) => (
        <Solid key={x} p={[x, 0.25, -1.1]} s={[3, 0.5, 1]} m={mat('#3d6f96', { rough: 0.95 })}>
          <mesh position={[0, 0.45, 0.4]} material={mat('#3d6f96', { rough: 0.95 })}><boxGeometry args={[3, 0.5, 0.25]} /></mesh>
        </Solid>
      ))}
      {[[-12.9, -7.2], [12.9, -7.2], [-12.9, -3], [12.9, -3], [-3.4, -7.3], [3.4, -7.3]].map(([x, z]) => <Plant key={`${x}${z}`} p={[x, 0, z]} />)}
      {/* play mat for the kickable balls (no walls, so nobody gets wedged) */}
      <mesh position={[8.5, 0.045, -4.2]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#ffd166', { rough: 0.9 })}><circleGeometry args={[1.8, 40]} /></mesh>
    </group>
  )
}

function Outside() {
  const nameTex = sign([{ t: WORLD.station, size: 76, bold: true, color: '#fff4e0' }], { w: 1024, h: 160, bg: NAVY, border: '#e8b04a' })
  const welcome = sign(
    [{ t: WORLD.welcome[0], size: 64, bold: true, color: NAVY }, ...WORLD.welcome.slice(1).map((t) => ({ t, size: 34 }))],
    { w: 768, h: 420, border: NAVY },
  )
  const pillar = mat(NAVY, { rough: 0.4, metal: 0.4 })
  return (
    <group>
      {/* entrance canopy */}
      {[-2.4, 2.4].map((x) => <Solid key={x} p={[x, 1.75, 4.4]} s={[0.4, 3.5, 0.4]} m={pillar} />)}
      <mesh position={[0, 3.6, 2.4]} material={mat(NAVY, { rough: 0.4, metal: 0.3 })}><boxGeometry args={[6.2, 0.25, 5]} /></mesh>
      {[0.6, 1.4, 2.2, 3, 3.8].map((z) => <mesh key={z} position={[0, 3.4, z]} material={mat('#dfe7ec', { metal: 0.6, rough: 0.3 })}><boxGeometry args={[5.8, 0.12, 0.12]} /></mesh>)}
      <Board p={[0, 3.62, 4.92]} w={5.4} h={0.8} tex={nameTex} />
      <mesh position={[0, 3.47, 2.4]} material={mat('#fff6df', { glow: 1.2 })}><boxGeometry args={[0.3, 0.04, 4.4]} /></mesh>
      {/* welcome sign on posts, turned toward the diver */}
      <group position={[-4.2, 0, 8.5]} rotation={[0, 0.45, 0]}>
        {[-1.4, 1.4].map((x) => <Solid key={x} p={[x, 0.9, -0.05]} s={[0.12, 1.8, 0.12]} m={pillar} />)}
        <Solid p={[0, 1.7, -0.04]} s={[3.2, 1.75, 0.08]} m={pillar} />
        <Board p={[0, 1.7, 0.01]} w={3.2} h={1.75} tex={welcome} />
      </group>
      {/* lamp posts */}
      {[-4, 4].map((x) => (
        <group key={x} position={[x, 0, 6.5]}>
          <Solid p={[0, 1.2, 0]} s={[0.12, 2.4, 0.12]} m={pillar} />
          <mesh position={[0, 2.55, 0]} material={mat('#fff1c7', { glow: 2 })}><sphereGeometry args={[0.22, 16, 12]} /></mesh>
        </group>
      ))}
      {/* pipes along the outside walls, and a base the station sits on */}
      {[-OUTER_X - 0.35, OUTER_X + 0.35].flatMap((x) => [0.45, 2.7].map((y) => (
        <mesh key={`${x}${y}`} position={[x, y, (LOBBY.z1 + CORRIDOR.z0) / 2]} rotation={[Math.PI / 2, 0, 0]} material={mat('#c8d6de', { metal: 0.7, rough: 0.35 })}>
          <cylinderGeometry args={[0.12, 0.12, LOBBY.z1 - CORRIDOR.z0, 12]} />
        </mesh>
      )))}
      <RigidBody type="fixed" colliders={false}>
        {[-OUTER_X - 0.35, OUTER_X + 0.35].map((x) => <CuboidCollider key={x} args={[0.12, 1.25, (LOBBY.z1 - CORRIDOR.z0) / 2]} position={[x, 1.55, (LOBBY.z1 + CORRIDOR.z0) / 2]} />)}
      </RigidBody>
      <mesh position={[0, -0.05, (LOBBY.z1 + DECK.z0) / 2]} material={mat('#8a97a3', { rough: 0.95 })}>
        <boxGeometry args={[OUTER_X * 2 + 1.2, 0.14, LOBBY.z1 - DECK.z0 + 1.2]} />
      </mesh>
    </group>
  )
}

function Deck({ ready, onEnter, onLeave }: { ready: boolean; onEnter: () => void; onLeave: () => void }) {
  const [x, z] = LICENSE_POS
  return (
    <group>
      <Console p={[x, 0, z]} r={0} color="#e8b04a" lines={[WORLD.areas.deck[0], LICENSE.title, ready ? WORLD.consoleDone : WORLD.consolePress]} onEnter={onEnter} onLeave={onLeave} />
      {/* ship's wheel by the big window */}
      <group position={[3.6, 1.4, DECK.z0 + 0.8]}>
        <mesh material={mat('#8a5a2b', { rough: 0.6 })}><torusGeometry args={[0.6, 0.06, 10, 32]} /></mesh>
        {[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} material={mat('#8a5a2b', { rough: 0.6 })}><boxGeometry args={[1.5, 0.06, 0.06]} /></mesh>)}
        <Solid p={[0, -0.75, -0.1]} s={[0.25, 1.3, 0.25]} m={mat('#6b4423', { rough: 0.7 })} />
      </group>
      <Plant p={[-5.3, 0, DECK.z1 - 0.8]} />
      <Plant p={[5.3, 0, DECK.z1 - 0.8]} />
    </group>
  )
}

type Props = { done: ReadonlySet<LessonId>; ready: boolean; strawberry: string[] | null; near: (s: LessonId | 'license', on: boolean) => void }

export default function Station({ done, ready, strawberry, near }: Props) {
  return (
    <StaticBatch>
      <Floor r={LOBBY} color="#e9e2d4" />
      <Floor r={CORRIDOR} color="#d8e2e8" />
      <Floor r={DECK} color="#c9a87c" />
      <mesh position={[0, 0.04, (CORRIDOR.z0 + CORRIDOR.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={mat(NAVY, { rough: 0.9 })}>
        <planeGeometry args={[1.6, CORRIDOR.z1 - CORRIDOR.z0]} />
      </mesh>

      {walls().map((w, i) => <Wall key={i} w={w} />)}
      <Ceiling />
      <Outside />
      <Lobby />
      {ROOMS.map((room) => <LabRoom key={room.id} room={room} done={done.has(room.id)} strawberry={strawberry} near={near} />)}
      <Deck ready={ready} onEnter={() => near('license', true)} onLeave={() => near('license', false)} />
    </StaticBatch>
  )
}

function LabRoom({ room, done, strawberry, near }: { room: Room; done: boolean; strawberry: string[] | null; near: Props['near'] }) {
  const l = LESSONS.find((x) => x.id === room.id)!
  const cx = (room.x0 + room.x1) / 2
  const cz = (room.z0 + room.z1) / 2
  const tag = `${l.bonus ? UI.bonusLab : UI.lab} ${l.num}`
  const doorSign = sign([{ t: tag, size: 38, bold: true, color: room.color }, { t: l.title, size: 58, bold: true, color: '#fff4e0' }], { w: 640, h: 200, bg: '#04182b', border: room.color })
  return (
    <group>
      <Floor r={room} color={tint(room.color, 0.22)} />
      {/* blade sign sticking out over each door, readable from the camera behind the diver */}
      <group position={[room.side * (CORRIDOR.x1 - 0.95), 2.45, room.doorZ + DOOR_W / 2 + 0.2]}>
        <mesh position={[room.side * 0.8, 0.45, 0]} material={mat(NAVY, { metal: 0.5, rough: 0.4 })}><boxGeometry args={[0.1, 0.06, 0.06]} /></mesh>
        <Board p={[0, 0, 0.02]} w={1.7} h={0.53} tex={doorSign} />
      </group>
      <mesh position={[cx, WALL_H - 0.03, cz]} material={mat('#fff6df', { glow: 1.1 })}><boxGeometry args={[3, 0.05, 0.5]} /></mesh>
      <group position={[cx, 0, cz]}>
        <RoomProps id={room.id} side={room.side} strawberry={strawberry} />
      </group>
      <Console
        p={[room.console[0], 0, room.console[1]]}
        r={0}
        color={room.color}
        lines={[tag, l.title, done ? WORLD.consoleDone : WORLD.consolePress]}
        onEnter={() => near(room.id, true)}
        onLeave={() => near(room.id, false)}
      />
    </group>
  )
}
