// Small building blocks shared by the station, its rooms and the demos.
import { createContext, useEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { mat } from './textures.ts'

type V3 = [number, number, number]

export const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// High graphics adds real lights and shadows; Low keeps weak school computers smooth.
export const HighQuality = createContext(true)

// A box you can see and bump into.
export function Solid({ p, s, m, r = 0, children }: { p: V3; s: V3; m: THREE.Material; r?: number; children?: ReactNode }) {
  return (
    <RigidBody type="fixed" colliders={false} position={p} rotation={[0, r, 0]}>
      <mesh material={m}>
        <boxGeometry args={s} />
      </mesh>
      <CuboidCollider args={[s[0] / 2, s[1] / 2, s[2] / 2]} />
      {children}
    </RigidBody>
  )
}

// A flat painted sign (a thin board facing +z).
export function Board({ p, r = 0, w, h, tex, dynamic }: { p: V3; r?: number; w: number; h: number; tex: THREE.Texture; dynamic?: boolean }) {
  return (
    <mesh position={p} rotation={[0, r, 0]} material={mat('#ffffff', { map: tex, rough: 0.6 })} userData={{ dynamic }}>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

// Merges every still mesh inside it into one mesh per material, turning ~800 draw calls into a few dozen.
// Anything marked userData.dynamic (moving, pulsing or changing its picture) is left alone.
// It runs two frames after mount, once physics has placed every body.
export function StaticBatch({ children }: { children: ReactNode }) {
  const root = useRef<THREE.Group>(null)
  const frames = useRef(0)
  const undo = useRef<(() => void) | null>(null)
  useFrame(() => {
    if (frames.current++ !== 2 || !root.current) return
    const g = root.current
    g.updateMatrixWorld(true)
    const inv = g.matrixWorld.clone().invert()
    const buckets = new Map<THREE.Material, { geos: THREE.BufferGeometry[]; meshes: THREE.Mesh[]; noShadow: boolean }>()
    const hidden: THREE.Mesh[] = []
    const walk = (o: THREE.Object3D) => {
      if (o.userData.dynamic || !o.visible) return
      const m = o as THREE.Mesh
      if (m.isMesh && !(m as THREE.InstancedMesh).isInstancedMesh && !Array.isArray(m.material)) {
        const geo = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(inv.clone().multiply(m.matrixWorld))
        for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k)
        geo.morphAttributes = {}
        const b = buckets.get(m.material) ?? { geos: [], meshes: [], noShadow: false }
        b.geos.push(geo)
        b.meshes.push(m)
        b.noShadow ||= !!m.userData.noShadow
        buckets.set(m.material, b)
      }
      o.children.forEach(walk)
    }
    walk(g)
    const merged: THREE.Mesh[] = []
    for (const [material, b] of buckets) {
      const geometry = mergeGeometries(b.geos)
      b.geos.forEach((x) => x.dispose())
      if (!geometry) continue // merge failed: keep the original meshes showing
      hidden.push(...b.meshes)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData.noShadow = b.noShadow
      merged.push(mesh)
      g.add(mesh)
    }
    hidden.forEach((m) => (m.visible = false))
    undo.current = () => {
      merged.forEach((m) => { g.remove(m); m.geometry.dispose() })
      hidden.forEach((m) => (m.visible = true))
    }
  })
  useEffect(() => () => undo.current?.(), [])
  return <group ref={root}>{children}</group>
}
