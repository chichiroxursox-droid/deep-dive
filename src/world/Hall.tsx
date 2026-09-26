import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { Sparkles } from '@react-three/drei'

export const HALL_RADIUS = 18
const WALL_SEGMENTS = 32

// Round station floor with an invisible ring wall so the diver can't walk off.
export default function Hall() {
  const segWidth = (2 * Math.PI * HALL_RADIUS) / WALL_SEGMENTS
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.25, HALL_RADIUS + 1]} position={[0, -0.25, 0]} />
        {Array.from({ length: WALL_SEGMENTS }, (_, i) => {
          const a = (i / WALL_SEGMENTS) * Math.PI * 2
          return (
            <CuboidCollider
              key={i}
              args={[segWidth / 2 + 0.2, 4, 0.4]}
              position={[Math.sin(a) * HALL_RADIUS, 4, Math.cos(a) * HALL_RADIUS]}
              rotation={[0, a, 0]}
            />
          )
        })}
        {/* center kiosk (Diver's License) is solid */}
        <CylinderCollider args={[1, 1.1]} position={[0, 1, 0]} />
      </RigidBody>

      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[HALL_RADIUS + 1, HALL_RADIUS + 1, 0.5, 64]} />
        <meshStandardMaterial color="#1b4a6b" roughness={0.9} />
      </mesh>
      {[6, 11].map((r) => (
        <mesh key={r} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.08, r + 0.08, 96]} />
          <meshBasicMaterial color="#5ef2e6" transparent opacity={0.35} />
        </mesh>
      ))}
      {/* glass dome wall */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[HALL_RADIUS + 0.6, HALL_RADIUS + 0.6, 10, 64, 1, true]} />
        <meshStandardMaterial color="#7fd6ff" transparent opacity={0.12} side={2} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[HALL_RADIUS + 0.6, 0.35, 12, 96]} />
        <meshStandardMaterial color="#e8b04a" metalness={0.6} roughness={0.35} />
      </mesh>
      <Sparkles count={140} scale={[HALL_RADIUS * 2, 12, HALL_RADIUS * 2]} position={[0, 6, 0]} size={4} speed={0.35} color="#c9f7ff" />
    </>
  )
}
