// The sea floor around the station: sand, light ripples, rocks, kelp, fish, light rays and bubbles.
import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances, Sparkles } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { calm } from './parts.tsx'
import { caustics, mat, sand } from './textures.ts'
import { DECK, OUTER_X } from './layout.ts'

type V3 = [number, number, number]

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

// Random spots on the sea floor that stay clear of the station and the path to its door.
function spots(n: number, seed: number, min = 18, max = 70): V3[] {
  const r = rng(seed)
  const out: V3[] = []
  while (out.length < n) {
    const a = r() * Math.PI * 2
    const d = min + r() * (max - min)
    const x = Math.cos(a) * d
    const z = Math.sin(a) * d - 20
    const nearStation = x > -OUTER_X - 2 && x < OUTER_X + 2 && z > DECK.z0 - 2 && z < 2
    const onPath = Math.abs(x) < 5 && z > 0 && z < 22
    if (!nearStation && !onPath) out.push([x, 0, z])
  }
  return out
}

// All the kelp as two instanced meshes (stems, leaves), swayed by rewriting their matrices each frame.
function KelpField({ spots }: { spots: V3[] }) {
  const stems = useRef<THREE.InstancedMesh>(null)
  const leaves = useRef<THREE.InstancedMesh>(null)
  const plants = useMemo(() => spots.map((p, i) => ({ p, h: 3 + (i % 5) * 1.3, phase: i, n: Math.floor((3 + (i % 5) * 1.3) / 1.1) })), [spots])
  const leafCount = plants.reduce((s, k) => s + k.n, 0)
  const tmp = useMemo(() => ({ base: new THREE.Object3D(), part: new THREE.Object3D(), m: new THREE.Matrix4() }), [])
  const drawn = useRef(false)
  useFrame(({ clock }) => {
    if (!stems.current || !leaves.current || (calm && drawn.current)) return
    drawn.current = true
    let li = 0
    plants.forEach((k, i) => {
      const t = clock.elapsedTime * 0.8 + k.phase
      tmp.base.position.set(...k.p)
      tmp.base.rotation.set(Math.cos(t * 0.7) * 0.06, 0, Math.sin(t) * 0.08)
      tmp.base.updateMatrix()
      tmp.part.position.set(0, k.h / 2, 0)
      tmp.part.rotation.set(0, 0, 0)
      tmp.part.scale.set(1, k.h, 1)
      tmp.part.updateMatrix()
      stems.current!.setMatrixAt(i, tmp.m.multiplyMatrices(tmp.base.matrix, tmp.part.matrix))
      for (let j = 0; j < k.n; j++) {
        tmp.part.position.set(j % 2 ? 0.18 : -0.18, 0.8 + j * 1.1, 0)
        tmp.part.rotation.set(0, j, j % 2 ? -0.6 : 0.6)
        tmp.part.scale.set(0.5, 1.6, 0.12)
        tmp.part.updateMatrix()
        leaves.current!.setMatrixAt(li++, tmp.m.multiplyMatrices(tmp.base.matrix, tmp.part.matrix))
      }
    })
    stems.current.instanceMatrix.needsUpdate = true
    leaves.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={stems} args={[undefined, undefined, plants.length]} material={mat('#3f7d3a', { rough: 0.8 })}>
        <cylinderGeometry args={[0.04, 0.07, 1, 6]} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, undefined, leafCount]} material={mat('#5a9c45', { rough: 0.8 })}>
        <sphereGeometry args={[0.3, 10, 8]} />
      </instancedMesh>
    </>
  )
}

// A school of fish swimming a slow circle.
function School({ c, r, y, speed, color, n }: { c: V3; r: number; y: number; speed: number; color: string; n: number }) {
  const g = useRef<THREE.Group>(null)
  const fish = useMemo(() => {
    const rand = rng(Math.round(r * 100 + y))
    return Array.from({ length: n }, () => ({ a: rand() * 0.9, dr: (rand() - 0.5) * 2, dy: (rand() - 0.5) * 1.4, s: 0.7 + rand() * 0.5 }))
  }, [r, y, n])
  useFrame((_, dt) => {
    if (!calm && g.current) g.current.rotation.y += dt * speed
  })
  return (
    <group ref={g} position={[c[0], y, c[2]]}>
      <Instances limit={n} material={mat(color, { rough: 0.4, metal: 0.2 })}>
        <sphereGeometry args={[0.25, 10, 8]} />
        {fish.map((f, i) => <Instance key={i} position={[Math.cos(f.a) * (r + f.dr), f.dy, Math.sin(f.a) * (r + f.dr)]} scale={[0.45 * f.s, 0.7 * f.s, 1.4 * f.s]} rotation={[0, -f.a, 0]} />)}
      </Instances>
      <Instances limit={n} material={mat(color, { rough: 0.4 })}>
        <sphereGeometry args={[0.25, 8, 6]} />
        {fish.map((f, i) => {
          // the tail trails behind the way the school swims
          const dir = Math.sign(speed)
          const back: V3 = [Math.cos(f.a) * (r + f.dr) - dir * Math.sin(f.a) * 0.45 * f.s, f.dy, Math.sin(f.a) * (r + f.dr) + dir * Math.cos(f.a) * 0.45 * f.s]
          return <Instance key={i} position={back} scale={[0.08, 0.5 * f.s, 0.45 * f.s]} rotation={[0, -f.a, 0]} />
        })}
      </Instances>
    </group>
  )
}

function Ocean({ high }: { high: boolean }) {
  const light = useRef<THREE.Mesh>(null)
  const rocks = useMemo(() => spots(high ? 46 : 20, 21), [high])
  const kelp = useMemo(() => spots(high ? 44 : 14, 33, 17, 55), [high])
  const coral = useMemo(() => {
    const r = rng(8)
    const cols = ['#ff7a59', '#ff5c8a', '#ffd166', '#a78bfa', '#5ef2e6']
    return Array.from({ length: high ? 40 : 16 }, (_, i) => {
      const side = i % 2 ? 1 : -1
      return { p: [side * (OUTER_X + 1.6 + r() * 2.5), 0.2 + r() * 0.3, -2 - r() * 36] as V3, s: 0.3 + r() * 0.5, c: cols[i % cols.length] }
    })
  }, [high])
  const floorTex = sand([60, 60])
  const causticTex = caustics([18, 18])
  useFrame((_, dt) => {
    if (calm || !light.current) return
    causticTex.offset.x += dt * 0.012
    causticTex.offset.y += dt * 0.008
  })
  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[120, 0.5, 120]} position={[0, -0.5, -20]} />
        {/* invisible edge so nobody walks off the world */}
        {[[0, -95, 120, 1], [0, 55, 120, 1], [-100, -20, 1, 120], [100, -20, 1, 120]].map(([x, z, w, d]) => (
          <CuboidCollider key={`${x}${z}`} args={[w, 5, d]} position={[x, 5, z]} />
        ))}
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} material={mat('#ffffff', { map: floorTex, rough: 1 })} receiveShadow>
        <planeGeometry args={[240, 240]} />
      </mesh>
      {high && (
        <mesh ref={light} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -20]}>
          <planeGeometry args={[240, 240]} />
          <meshBasicMaterial map={causticTex} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      <Instances limit={rocks.length} material={mat('#6f7c86', { rough: 0.95 })}>
        <dodecahedronGeometry args={[1, 0]} />
        {rocks.map((p, i) => <Instance key={i} position={[p[0], 0.2, p[2]]} scale={[0.8 + (i % 5) * 0.5, 0.5 + (i % 3) * 0.4, 0.8 + (i % 4) * 0.4]} rotation={[i, i * 2, 0]} />)}
      </Instances>
      <Instances limit={coral.length} material={mat('#ffffff', { rough: 0.6 })}>
        <icosahedronGeometry args={[1, 1]} />
        {coral.map((c, i) => <Instance key={i} position={c.p} scale={c.s} color={c.c} />)}
      </Instances>
      <KelpField spots={kelp} />
      <School c={[-4, 0, 34]} r={10} y={7} speed={0.18} color="#ffd166" n={high ? 14 : 6} />
      <School c={[-26, 0, -18]} r={7} y={3} speed={-0.22} color="#ff7a59" n={high ? 12 : 5} />
      <School c={[26, 0, -30]} r={10} y={5} speed={0.15} color="#7fb3ff" n={high ? 16 : 6} />
      {/* sun rays coming down through the water */}
      {high && [[-10, 16], [12, 10], [-24, -12], [24, -28], [-20, -46], [8, -60]].map(([x, z], i) => (
        <mesh key={i} position={[x, 14, z]} rotation={[0.18, 0, i % 2 ? 0.15 : -0.15]}>
          <cylinderGeometry args={[1.2, 4.5, 30, 20, 1, true]} />
          <meshBasicMaterial color="#bff0ff" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {high && !calm && <Sparkles count={160} scale={[90, 16, 110]} position={[0, 8, -20]} size={5} speed={0.35} color="#d8f7ff" opacity={0.6} />}
    </group>
  )
}

export default memo(Ocean)
