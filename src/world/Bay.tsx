import { Html, RoundedBox } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { ReactNode } from 'react'

type Props = {
  position: [number, number, number]
  rotationY: number
  label: string
  color: string
  done: boolean
  prop: ReactNode
  onEnter: () => void
  onLeave: () => void
}

// One lab bay: glowing pad, arch, sign, one themed prop, and a trigger zone.
// Local +Z faces the center of the hall.
export default function Bay({ position, rotationY, label, color, done, prop, onEnter, onLeave }: Props) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.12, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={done ? 0.6 : 0.2} />
      </mesh>
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 1.6, -1.6]}>
          <boxGeometry args={[0.3, 3.2, 0.3]} />
          <meshStandardMaterial color="#e8b04a" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 3.3, -1.6]}>
        <boxGeometry args={[4.4, 0.4, 0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0, 4.2, -1.6]} center distanceFactor={22} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-xl border-2 border-glow bg-abyss/85 px-3 py-1 text-center text-lg font-bold text-sand">
          {label}{done ? ' ✓' : ''}
        </div>
      </Html>
      <group position={[0, 0, -0.6]}>{prop}</group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider sensor args={[2.8, 1.5, 3]} position={[0, 1.5, 0.3]} onIntersectionEnter={onEnter} onIntersectionExit={onLeave} />
      </RigidBody>
    </group>
  )
}

const m = (color: string, emissive = 0) => <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} />

// One themed prop per lesson, built from primitives.
export const PROPS: Record<string, ReactNode> = {
  // coral made of colored chunks, like tokens
  tokens: (
    <group>
      {[['#ff7a59', -0.7, 0.4], ['#5ef2e6', 0, 0.5], ['#ff5c8a', 0.7, 0.35], ['#7ddc8a', -0.35, 1.2], ['#ffd166', 0.4, 1.25], ['#ff7a59', 0, 2]].map(([c, x, y], i) => (
        <RoundedBox key={i} args={[0.6, 0.6, 0.6]} radius={0.12} position={[x as number, y as number, 0]} rotation={[0, i * 0.4, 0]}>
          {m(c as string, 0.3)}
        </RoundedBox>
      ))}
    </group>
  ),
  // word machine with a screen and a temperature dial
  guess: (
    <group position={[0, 1, 0]}>
      <RoundedBox args={[1.8, 2, 1]} radius={0.15}>{m('#6c8ea8')}</RoundedBox>
      <mesh position={[0, 0.35, 0.51]}><planeGeometry args={[1.3, 0.7]} />{m('#5ef2e6', 0.8)}</mesh>
      <mesh position={[0, -0.5, 0.52]}><torusGeometry args={[0.25, 0.07, 10, 24]} />{m('#ff7a59', 0.4)}</mesh>
    </group>
  ),
  backpack: (
    <group position={[0, 1, 0]}>
      <RoundedBox args={[1.4, 1.8, 0.9]} radius={0.3}>{m('#ff7a59')}</RoundedBox>
      <RoundedBox args={[1, 0.8, 0.3]} radius={0.12} position={[0, -0.3, 0.5]}>{m('#ffd166')}</RoundedBox>
      <mesh position={[0, 1, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.35, 0.08, 10, 24, Math.PI]} />{m('#ffd166')}</mesh>
    </group>
  ),
  chef: (
    <group>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.9, 0.8, 1.2, 28]} />{m('#b8c4cc')}</mesh>
      <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.95, 0.95, 0.1, 28]} />{m('#8795a0')}</mesh>
      <mesh position={[0, 1.9, 0]}><cylinderGeometry args={[0.4, 0.45, 0.8, 20]} />{m('#ffffff', 0.2)}</mesh>
      {[-0.3, 0, 0.3].map((x) => <mesh key={x} position={[x, 2.4, 0]}><sphereGeometry args={[0.32, 16, 12]} />{m('#ffffff', 0.2)}</mesh>)}
    </group>
  ),
  toolbox: (
    <group position={[0, 0.5, 0]}>
      <RoundedBox args={[1.8, 1, 1]} radius={0.1}>{m('#a78bfa')}</RoundedBox>
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.4, 0.07, 10, 24, Math.PI]} />{m('#e8b04a')}</mesh>
      <mesh position={[0.5, 1.3, 0]} rotation={[0, 0, 0.6]}><cylinderGeometry args={[0.08, 0.08, 1.2, 10]} />{m('#c8d6de')}</mesh>
      <mesh position={[0.85, 1.8, 0]}><torusGeometry args={[0.18, 0.07, 8, 16]} />{m('#c8d6de')}</mesh>
    </group>
  ),
  // a bookshelf with three books
  library: (
    <group>
      <RoundedBox args={[2, 2.2, 0.6]} radius={0.08} position={[0, 1.1, 0]}>{m('#7a5230')}</RoundedBox>
      {[['#ff7a59', -0.55], ['#5ef2e6', 0], ['#ffd166', 0.55]].map(([c, x]) => (
        <mesh key={c as string} position={[x as number, 1.5, 0.2]}><boxGeometry args={[0.4, 0.9, 0.4]} />{m(c as string, 0.3)}</mesh>
      ))}
    </group>
  ),
  factcheck: (
    <group position={[0, 1.1, 0]}>
      <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[0.12, 0.3, 1, 12]} />{m('#e8b04a')}</mesh>
      <mesh position={[-0.45, 0, 0]} rotation={[-0.5, 0, 0.2]}><boxGeometry args={[0.9, 0.06, 1.2]} />{m('#fff4e0')}</mesh>
      <mesh position={[0.45, 0, 0]} rotation={[-0.5, 0, -0.2]}><boxGeometry args={[0.9, 0.06, 1.2]} />{m('#fff4e0')}</mesh>
      <mesh position={[0.9, 0.9, 0.4]}><torusGeometry args={[0.35, 0.07, 10, 28]} />{m('#5ef2e6', 0.5)}</mesh>
      <mesh position={[1.25, 0.45, 0.4]} rotation={[0, 0, 0.7]}><cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />{m('#e8b04a')}</mesh>
    </group>
  ),
}
