import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { CameraControls, useKeyboardControls } from '@react-three/drei'
import { Ecctrl, type EcctrlHandle, type MovementInput } from 'ecctrl'
import { SPAWN } from './layout.ts'
import { calm } from './parts.tsx'
import { cameraBlockers } from './Station.tsx'
import { mat } from './textures.ts'

const STILL: MovementInput = { forward: false, backward: false, leftward: false, rightward: false, run: false, jump: false }

// ecctrl v2 doesn't read the keyboard itself: we feed it drei's key state every frame.
// The camera rides low behind the diver, like a game, and slides in front of walls instead of through them.
export default function Diver({ enabled, player }: { enabled: boolean; player: MutableRefObject<THREE.Vector3> }) {
  const diver = useRef<EcctrlHandle>(null)
  const cam = useRef<CameraControls>(null)
  const legs = useRef<THREE.Group[]>([])
  const arms = useRef<THREE.Group[]>([])
  const walk = useRef(0)
  const [, getKeys] = useKeyboardControls()

  const blockers = useMemo(() => cameraBlockers(), [])
  useEffect(() => {
    const c = cam.current
    if (!c) return
    c.colliderMeshes = [blockers]
    c.setLookAt(SPAWN[0], 3, SPAWN[2] + 5.5, SPAWN[0], 1.7, SPAWN[2], false)
  }, [blockers])

  useFrame((_, dt) => {
    const d = diver.current
    if (!d) return
    d.setMovement(enabled ? (getKeys() as MovementInput) : STILL)
    const p = d.currPos
    player.current.copy(p)
    // If a bump ever tips the diver over, stand it back up.
    if (d.bodyYAxis.y < 0.8) {
      d.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      d.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }
    cam.current?.moveTo(p.x, p.y + 0.7, p.z, true)
    // swing arms and legs while walking
    const speed = Math.min(1, d.moveSpeed / 4)
    walk.current += dt * (4 + d.moveSpeed * 1.8)
    const swing = calm ? 0 : Math.sin(walk.current) * 0.6 * speed
    legs.current.forEach((g, i) => g && (g.rotation.x = i ? swing : -swing))
    arms.current.forEach((g, i) => g && (g.rotation.x = i ? -swing : swing))
  })

  const suit = mat('#ff7a59', { rough: 0.7 })
  const brass = mat('#e8b04a', { metal: 0.85, rough: 0.28 })
  const boot = mat('#2b3a4a', { rough: 0.6 })
  return (
    <>
      <Ecctrl ref={diver} position={SPAWN} rotation={[0, Math.PI, 0]} enable={enabled} capsuleHalfHeight={0.35} capsuleRadius={0.35} maxWalkVel={4} maxRunVel={7}>
        <group position={[0, -0.05, 0]}>
          <mesh position={[0, 0, 0]} material={suit}><capsuleGeometry args={[0.33, 0.4, 8, 16]} /></mesh>
          <mesh position={[0, 0.02, 0.2]} material={mat('#ffd166', { rough: 0.5 })}><boxGeometry args={[0.3, 0.22, 0.2]} /></mesh>
          {/* brass helmet with a collar and three round windows */}
          <mesh position={[0, 0.42, 0]} material={brass}><cylinderGeometry args={[0.36, 0.4, 0.12, 24]} /></mesh>
          <mesh position={[0, 0.72, 0]} material={brass}><sphereGeometry args={[0.36, 28, 20]} /></mesh>
          {[[0, 0.72, 0.31, 0, 0.19], [0.3, 0.72, 0.08, Math.PI / 2, 0.1], [-0.3, 0.72, 0.08, -Math.PI / 2, 0.1]].map(([x, y, z, r, s], i) => (
            <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
              <mesh material={brass}><torusGeometry args={[s, 0.03, 8, 24]} /></mesh>
              <mesh position={[0, 0, 0.005]} material={mat('#5ef2e6', { glow: 0.6, rough: 0.1, metal: 0.3 })}><circleGeometry args={[s, 24]} /></mesh>
            </group>
          ))}
          {/* air tank and hose */}
          <mesh position={[0, 0.12, -0.38]} material={mat('#dfe7ec', { metal: 0.6, rough: 0.3 })}><capsuleGeometry args={[0.14, 0.45, 6, 12]} /></mesh>
          <mesh position={[0.18, 0.5, -0.28]} rotation={[0.6, 0, 0.3]} material={boot}><torusGeometry args={[0.18, 0.025, 6, 16, Math.PI]} /></mesh>
          {[-1, 1].map((sx, i) => (
            <group key={`a${i}`} ref={(g) => { if (g) arms.current[i] = g }} position={[sx * 0.42, 0.22, 0]}>
              <mesh position={[0, -0.18, 0]} material={suit}><capsuleGeometry args={[0.1, 0.3, 4, 8]} /></mesh>
              <mesh position={[0, -0.42, 0]} material={boot}><sphereGeometry args={[0.1, 10, 8]} /></mesh>
            </group>
          ))}
          {[-1, 1].map((sx, i) => (
            <group key={`l${i}`} ref={(g) => { if (g) legs.current[i] = g }} position={[sx * 0.16, -0.3, 0]}>
              <mesh position={[0, -0.12, 0]} material={suit}><capsuleGeometry args={[0.12, 0.18, 4, 8]} /></mesh>
              <mesh position={[0, -0.33, 0.05]} material={boot}><boxGeometry args={[0.22, 0.14, 0.34]} /></mesh>
            </group>
          ))}
        </group>
      </Ecctrl>
      <CameraControls ref={cam} makeDefault minDistance={1.5} maxDistance={9} minPolarAngle={0.5} maxPolarAngle={1.5} />
    </>
  )
}
