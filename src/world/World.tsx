import { memo, useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Environment, KeyboardControls, Lightformer } from '@react-three/drei'
import Station from './Station.tsx'
import Ocean from './Ocean.tsx'
import Diver from './Diver.tsx'
import { Balls, BackpackBelt, NextWordMachine } from './Demos.tsx'
import { HighQuality } from './parts.tsx'
import { areaAt, SPAWN, type Area } from './layout.ts'
import { BOOKS, CORE, coreDone, fill, GUESS, HALL, LESSONS, LICENSE, UI, WORLD, type LessonId } from '../content.ts'
import { loadEncoder, split, type Encoder } from '../lessons/tokens/logic.ts'
import { loadModel, nextWords, words, type Guess } from '../lessons/guess/logic.ts'

export type Station = LessonId | 'license'

const KEYS = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'jump', keys: ['Space'] },
]
const WATER = '#0b4a6e'

type Props = { paused: boolean; done: ReadonlySet<LessonId>; onOpen: (s: Station) => void; onMap: () => void }

// The sun follows the diver so a small shadow map stays sharp everywhere in the station.
function Sun({ player, high }: { player: MutableRefObject<THREE.Vector3>; high: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null)
  useFrame(() => {
    const l = light.current
    if (!l) return
    const p = player.current
    l.position.set(p.x + 7, 22, p.z + 9)
    l.target.position.copy(p)
    l.target.updateMatrixWorld()
  })
  return (
    <directionalLight
      ref={light}
      intensity={1.9}
      color="#fff4e0"
      castShadow={high}
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-far={60}
    />
  )
}

// Solid meshes cast and catch shadows on High. Checked once a second so new balls and blocks join in.
function Shadows({ high }: { high: boolean }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const apply = () =>
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        const solid = !(m.material as THREE.Material).transparent && !m.userData.noShadow
        m.castShadow = high && solid
        m.receiveShadow = high
      })
    apply()
    const t = setInterval(apply, 1000)
    return () => clearInterval(t)
  }, [scene, high])
  return null
}

function AreaWatcher({ player, onArea, pos }: { player: MutableRefObject<THREE.Vector3>; onArea: (a: Area) => void; pos: MutableRefObject<HTMLElement | null> }) {
  const last = useRef<Area>('sea')
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    if (t.current < 0.2) return
    t.current = 0
    const { x, z } = player.current
    const a = areaAt(x, z)
    if (a !== last.current) onArea((last.current = a))
    if (pos.current) {
      pos.current.dataset.x = x.toFixed(1)
      pos.current.dataset.z = z.toFixed(1)
    }
  })
  return null
}

// The static world, memoized so HUD updates don't re-render hundreds of meshes.
const Scene = memo(function Scene({ high, done, near, strawberry }: { high: boolean; done: ReadonlySet<LessonId>; near: (s: Station, on: boolean) => void; strawberry: string[] | null }) {
  return (
    <>
      <Ocean high={high} />
      <Station done={done} ready={coreDone(done, LESSONS)} strawberry={strawberry} near={near} />
    </>
  )
})

export default function World({ paused, done, onOpen, onMap }: Props) {
  const [near, setNear] = useState<Station | null>(null)
  const [area, setArea] = useState<Area>('sea')
  const [high, setHigh] = useState(() => (navigator.hardwareConcurrency ?? 8) > 4)
  const [enc, setEnc] = useState<Encoder | null>(null)
  const [strawberry, setStrawberry] = useState<string[] | null>(null)
  const [top5, setTop5] = useState<Guess[] | null>(null)
  const player = useRef(new THREE.Vector3(...SPAWN))
  const kick = useRef<(from: THREE.Vector3) => void>(() => {})
  const pos = useRef<HTMLElement | null>(null)

  useEffect(() => {
    loadEncoder().then((e) => {
      setEnc(e)
      setStrawberry(split(e, 'strawberry').map((p) => p.text))
    })
    loadModel(BOOKS.map((b) => b.file)).then((m) => setTop5(nextWords(m, words(GUESS.prompt)).dist.slice(0, 5)))
  }, [])

  const onNear = useCallback((s: Station, on: boolean) => setNear((n) => (on ? s : n === s ? null : n)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paused) return
      if (e.code === 'KeyE' && near) onOpen(near)
      if (e.code === 'KeyF') kick.current(player.current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, paused, onOpen])

  const nearTitle = near === 'license' ? LICENSE.title : LESSONS.find((l) => l.id === near)?.title
  const lab = LESSONS.find((l) => l.id === area)
  const [title, sub] = lab ? [`${lab.bonus ? UI.bonusLab : UI.lab} ${lab.num}: ${lab.title}`, WORLD.areas.lab] : WORLD.areas[area as 'sea' | 'lobby' | 'corridor' | 'deck']
  const stamps = CORE.filter((l) => done.has(l.id)).length

  return (
    <div className="fixed inset-0">
      <KeyboardControls map={KEYS}>
        <Canvas shadows={high} dpr={high ? [1, 1.75] : 1} camera={{ fov: 50, near: 0.1, far: 220, position: [0, 6, 21] }} frameloop={paused ? 'never' : 'always'}>
          <HighQuality.Provider value={high}>
            <color attach="background" args={[WATER]} />
            <fog attach="fog" args={[WATER, 24, 90]} />
            {/* soft light and reflections from glowing panels, made here instead of downloading an image */}
            <Environment resolution={high ? 256 : 64} frames={1} environmentIntensity={0.85}>
              <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
              <Lightformer form="rect" intensity={1.1} color="#7fd6ff" position={[0, 3, 25]} scale={[50, 8, 1]} />
              <Lightformer form="rect" intensity={1.1} color="#7fd6ff" position={[0, 3, -25]} rotation-y={Math.PI} scale={[50, 8, 1]} />
              <Lightformer form="rect" intensity={0.8} color="#ffe2b8" position={[25, 4, 0]} rotation-y={-Math.PI / 2} scale={[50, 8, 1]} />
              <Lightformer form="rect" intensity={0.8} color="#bfe9ff" position={[-25, 4, 0]} rotation-y={Math.PI / 2} scale={[50, 8, 1]} />
            </Environment>
            <hemisphereLight args={['#e3f6ff', '#1b4a6b', 0.65]} />
            <Sun player={player} high={high} />
            <Shadows high={high} />
            <Physics paused={paused}>
              <Scene high={high} done={done} near={onNear} strawberry={strawberry} />
              <NextWordMachine active={area === 'guess'} top5={top5} />
              <BackpackBelt active={area === 'backpack'} enc={enc} />
              <Balls kick={kick} />
              <Diver enabled={!paused} player={player} />
              <AreaWatcher player={player} onArea={setArea} pos={pos} />
            </Physics>
          </HighQuality.Provider>
        </Canvas>
      </KeyboardControls>

      <div className="pointer-events-none fixed inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <div ref={(el) => { pos.current = el }} data-area={area} className="rounded-2xl bg-sand/95 px-4 py-2 text-abyss shadow-lg">
          <p className="text-lg font-black leading-tight">{title}</p>
          <p className="text-sm">{sub}</p>
        </div>
        <div className="rounded-2xl bg-sand/95 px-4 py-2 text-abyss shadow-lg" role="img" aria-label={fill(UI.labsDone, { n: stamps, total: CORE.length })}>
          <p className="text-xs font-bold uppercase tracking-wider">{HALL.license}</p>
          <p className="flex gap-1 pt-1" aria-hidden>
            {CORE.map((l) => (
              <span key={l.id} className={`grid size-6 place-items-center rounded-full text-xs font-black ${done.has(l.id) ? 'bg-coral text-abyss' : 'border-2 border-abyss/30 text-abyss/40'}`}>{l.num}</span>
            ))}
          </p>
        </div>
      </div>
      <p className="pointer-events-none fixed bottom-3 left-3 max-w-md rounded-xl bg-abyss/80 px-3 py-2 text-sm">{HALL.help}</p>
      <div className="fixed right-3 bottom-3 flex gap-2">
        <button className="btn-ghost bg-abyss/85 text-sm" onClick={onMap}>{UI.mapMode}</button>
        <button className="btn-ghost bg-abyss/85 text-sm" aria-pressed={high} onClick={() => setHigh(!high)}>
          {HALL.quality}: {high ? HALL.high : HALL.low}
        </button>
      </div>
      {near && !paused && (
        <button className="btn-main fixed bottom-20 left-1/2 -translate-x-1/2 text-lg shadow-lg" onClick={() => onOpen(near)}>
          {HALL.enter}: {nearTitle}
        </button>
      )}
    </div>
  )
}
