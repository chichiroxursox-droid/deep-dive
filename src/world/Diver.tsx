import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CameraControls, useKeyboardControls } from '@react-three/drei'
import { Ecctrl, type EcctrlHandle, type MovementInput } from 'ecctrl'

const STILL: MovementInput = { forward: false, backward: false, leftward: false, rightward: false, run: false, jump: false }
export const SPAWN: [number, number, number] = [0, 2, 6]

// ecctrl v2 doesn't read the keyboard itself: we feed it drei's key state every frame,
// and the camera follows the diver (movement is relative to where the camera looks).
export default function Diver({ enabled }: { enabled: boolean }) {
  const diver = useRef<EcctrlHandle>(null)
  const cam = useRef<CameraControls>(null)
  const [, getKeys] = useKeyboardControls()

  useEffect(() => {
    cam.current?.setLookAt(0, 6, 15, SPAWN[0], 1, SPAWN[2], false)
  }, [])

  useFrame(() => {
    const d = diver.current
    if (!d) return
    d.setMovement(enabled ? (getKeys() as MovementInput) : STILL)
    const p = d.currPos
    cam.current?.moveTo(p.x, p.y + 0.9, p.z, true)
  })

  return (
    <>
      <Ecctrl ref={diver} position={SPAWN} enable={enabled} capsuleHalfHeight={0.35} capsuleRadius={0.35} maxWalkVel={4} maxRunVel={7}>
        <DiverModel />
      </Ecctrl>
      <CameraControls ref={cam} makeDefault minDistance={5} maxDistance={14} minPolarAngle={0.5} maxPolarAngle={1.35} />
    </>
  )
}

// Orange suit, brass helmet with a glass window, air tank on the back. Front is +Z.
function DiverModel() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <capsuleGeometry args={[0.35, 0.55, 8, 16]} />
        <meshStandardMaterial color="#ff7a59" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.36, 24, 18]} />
        <meshStandardMaterial color="#e8b04a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.74, 0.27]}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial color="#5ef2e6" emissive="#5ef2e6" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.15, -0.4]}>
        <capsuleGeometry args={[0.15, 0.5, 6, 12]} />
        <meshStandardMaterial color="#c8d6de" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]}>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <meshStandardMaterial color="#ff7a59" />
        </mesh>
      ))}
    </group>
  )
}
