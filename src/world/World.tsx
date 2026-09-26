import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import { Html, KeyboardControls } from '@react-three/drei'
import Hall from './Hall.tsx'
import Bay, { PROPS } from './Bay.tsx'
import Diver from './Diver.tsx'
import { coreDone, HALL, LESSONS, LICENSE, UI, type LessonId } from '../content.ts'

export type Station = LessonId | 'license'

const KEYS = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'jump', keys: ['Space'] },
]
const COLORS = ['#ff7a59', '#5ef2e6', '#ffd166', '#7ddc8a', '#ff5c8a', '#a78bfa', '#7fb3ff', '#ffb38a']
const RING = 13

type Props = { paused: boolean; done: ReadonlySet<LessonId>; onOpen: (s: Station) => void }

export default function World({ paused, done, onOpen }: Props) {
  const [near, setNear] = useState<Station | null>(null)
  const leave = (s: Station) => () => setNear((n) => (n === s ? null : n))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && near && !paused) onOpen(near)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, paused, onOpen])

  const nearTitle = near === 'license' ? LICENSE.title : LESSONS.find((l) => l.id === near)?.title

  return (
    <div className="fixed inset-0">
      <KeyboardControls map={KEYS}>
        <Canvas camera={{ fov: 55, position: [0, 6, 15] }} dpr={[1, 1.5]} frameloop={paused ? 'never' : 'always'}>
          <color attach="background" args={['#062640']} />
          <fog attach="fog" args={['#062640', 14, 44]} />
          <ambientLight intensity={0.7} />
          <hemisphereLight args={['#9fe8ff', '#0a2a45', 0.9]} />
          <directionalLight position={[6, 14, 5]} intensity={1.3} />
          <Physics paused={paused}>
            <Hall />
            {LESSONS.map((l, i) => {
              const a = (i / LESSONS.length) * Math.PI * 2 + Math.PI
              return (
                <Bay
                  key={l.id}
                  position={[Math.sin(a) * RING, 0, Math.cos(a) * RING]}
                  rotationY={a + Math.PI}
                  label={`${l.bonus ? UI.bonusLab : UI.lab} ${l.num}: ${l.title}`}
                  color={COLORS[i]}
                  done={done.has(l.id)}
                  prop={PROPS[l.id]}
                  onEnter={() => setNear(l.id)}
                  onLeave={leave(l.id)}
                />
              )
            })}
            <LicenseKiosk ready={coreDone(done, LESSONS)} onEnter={() => setNear('license')} onLeave={leave('license')} />
            <Diver enabled={!paused} />
          </Physics>
        </Canvas>
      </KeyboardControls>
      {near && !paused && (
        <button className="btn-main absolute bottom-20 left-1/2 -translate-x-1/2 text-lg shadow-lg" onClick={() => onOpen(near)}>
          {HALL.enter}: {nearTitle}
        </button>
      )}
    </div>
  )
}

function LicenseKiosk({ ready, onEnter, onLeave }: { ready: boolean; onEnter: () => void; onLeave: () => void }) {
  return (
    <group>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 2, 32]} />
        <meshStandardMaterial color="#e8b04a" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.4, 0.9, 0.08]} />
        <meshStandardMaterial color="#5ef2e6" emissive="#5ef2e6" emissiveIntensity={ready ? 1 : 0.3} />
      </mesh>
      <Html position={[0, 3.4, 0]} center distanceFactor={12} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-xl border-2 border-coral bg-abyss/85 px-3 py-1 font-bold text-sand">
          {LICENSE.title}
        </div>
      </Html>
      <CuboidSensor onEnter={onEnter} onLeave={onLeave} />
    </group>
  )
}

function CuboidSensor({ onEnter, onLeave }: { onEnter: () => void; onLeave: () => void }) {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider sensor args={[2.4, 1.5, 2.4]} position={[0, 1.5, 0]} onIntersectionEnter={onEnter} onIntersectionExit={onLeave} />
    </RigidBody>
  )
}
