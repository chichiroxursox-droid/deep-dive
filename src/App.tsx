import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { BOOKS, CORE, fill, HALL, LESSONS, narration, READ, SAFETY, START, UI, type LessonId, type LessonMeta } from './content.ts'
import NARRATED from './narration.json'
import MapMode from './MapMode.tsx'
import Certificate from './Certificate.tsx'
import type { Station } from './world/World.tsx'

export type GameProps = { onDone: () => void }

// Map mode never downloads three.js: the 3D world is its own lazy chunk.
const World = lazy(() => import('./world/World.tsx'))
const LOADERS = {
  tokens: () => import('./lessons/tokens/Lesson.tsx'),
  guess: () => import('./lessons/guess/Lesson.tsx'),
  backpack: () => import('./lessons/backpack/Lesson.tsx'),
  chef: () => import('./lessons/chef/Lesson.tsx'),
  factcheck: () => import('./lessons/factcheck/Lesson.tsx'),
  toolbox: () => import('./lessons/toolbox/Lesson.tsx'),
  library: () => import('./lessons/library/Lesson.tsx'),
  harbor: () => import('./lessons/harbor/Lesson.tsx'),
}
const GAMES: Partial<Record<LessonId, ComponentType<GameProps>>> = Object.fromEntries(
  Object.entries(LOADERS).map(([id, load]) => [id, lazy(load)]),
)

// Fetch every lab, the tokenizer and the books in the background, so the app keeps working offline once loaded.
function prefetch() {
  Object.values(LOADERS).forEach((load) => load())
  import('./lessons/tokens/logic.ts').then((m) => m.loadEncoder())
  import('./lessons/guess/logic.ts').then((m) => m.loadModel(BOOKS.map((b) => b.file)))
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// ponytail: no touch joystick in the 3D hall, so touch devices get pointed at Map mode instead.
const touch = window.matchMedia('(pointer: coarse)').matches

const hasWebGL = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
})()

export default function App() {
  const [mode, setMode] = useState<'start' | 'hall' | 'map'>('start')
  const [open, setOpen] = useState<Station | null>(null)
  const [done, setDone] = useState<ReadonlySet<LessonId>>(new Set())
  const [name, setName] = useState('')

  useEffect(() => {
    const t = setTimeout(prefetch, 1500)
    return () => clearTimeout(t)
  }, [])

  const finish = useCallback((id: LessonId) => setDone((d) => (d.has(id) ? d : new Set(d).add(id))), [])

  return (
    <>
      {mode === 'start' && <Start onPick={setMode} />}
      {mode === 'hall' && (
        <>
          <Suspense fallback={<p className="p-8 text-xl">{UI.loadingStation}</p>}>
            <World paused={open !== null} done={done} onOpen={setOpen} />
          </Suspense>
          <div className="pointer-events-none fixed inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
            <p className="rounded-xl bg-abyss/80 px-3 py-2 text-sm">{HALL.help}</p>
            <div className="pointer-events-auto flex gap-2">
              <span className="rounded-xl bg-abyss/80 px-3 py-2 text-sm">{fill(UI.labsDone, { n: CORE.filter((l) => done.has(l.id)).length, total: CORE.length })}</span>
              <button className="btn-ghost bg-abyss/80" onClick={() => setMode('map')}>{UI.mapMode}</button>
            </div>
          </div>
        </>
      )}
      {mode === 'map' && <MapMode done={done} onOpen={setOpen} on3D={hasWebGL ? () => setMode('hall') : undefined} />}
      {open && (
        <Overlay onClose={() => setOpen(null)}>
          {open === 'license' ? (
            <Certificate done={done} name={name} onName={setName} />
          ) : (
            <Lesson id={open} onDone={() => finish(open)} />
          )}
        </Overlay>
      )}
    </>
  )
}

function Start({ onPick }: { onPick: (m: 'hall' | 'map') => void }) {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-6 p-6">
      <div className="flex items-center gap-4">
        <Pip size={72} />
        <div>
          <h1 className="text-5xl font-black tracking-tight text-glow">{START.title}</h1>
          <p className="text-xl">{START.tagline}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="btn-main text-xl" disabled={!hasWebGL} onClick={() => onPick('hall')} autoFocus={hasWebGL && !reducedMotion && !touch}>{START.dive}</button>
        <button className="btn-ghost text-xl" onClick={() => onPick('map')} autoFocus={!hasWebGL || reducedMotion || touch}>{START.map}</button>
      </div>
      <p className="text-sand/80">{!hasWebGL ? START.noWebGL : touch ? START.touch : reducedMotion ? START.calm : START.mapHint}</p>
      <section className="card border-2 border-line" aria-label="For teachers and parents">
        <p className="font-bold text-glow">{SAFETY}</p>
        <p className="mt-1 text-sand/80">{START.teachers}</p>
      </section>
    </main>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog ref={ref} onClose={onClose} className="m-auto max-h-[94vh] w-[min(58rem,96vw)] rounded-3xl border-2 border-line bg-deep p-0 text-sand">
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        {children}
        <button className="btn-ghost self-start" onClick={() => ref.current?.close()}>{UI.back}</button>
      </div>
    </dialog>
  )
}

function Lesson({ id, onDone }: { id: LessonId; onDone: () => void }) {
  const meta = LESSONS.find((l) => l.id === id)!
  const Game = GAMES[id]
  return (
    <>
      <header className="flex items-start gap-4">
        <Pip size={56} />
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-glow">{meta.bonus ? UI.bonusLab : UI.lab} {meta.num}</p>
          <h2 className="text-3xl font-black">{meta.title}</h2>
          <p className="mt-1 text-xl font-bold text-coral">{meta.rule}</p>
          <div className="mt-2 space-y-1 text-lg">{meta.intro.map((s) => <p key={s}>{s}</p>)}</div>
          <ReadAloud meta={meta} />
        </div>
      </header>
      {Game ? (
        <Suspense fallback={<p className="card">{UI.loadingLab}</p>}>
          <Game onDone={onDone} />
        </Suspense>
      ) : (
        <p className="card">{UI.building}</p>
      )}
    </>
  )
}

export function Pip({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Pip the robot" className="shrink-0">
      <line x1="32" y1="4" x2="32" y2="14" stroke="#ffd166" strokeWidth="3" />
      <circle cx="32" cy="5" r="4" fill="#ff7a59" />
      <rect x="8" y="14" width="48" height="40" rx="14" fill="#5ef2e6" />
      <rect x="15" y="22" width="34" height="20" rx="9" fill="#04182b" />
      <circle cx="25" cy="32" r="4.5" fill="#5ef2e6" />
      <circle cx="39" cy="32" r="4.5" fill="#5ef2e6" />
      <path d="M26 47 q6 4 12 0" stroke="#04182b" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// Plays the pre-made ElevenLabs clip. If the copy changed since it was made, or the clip can't load (offline), the browser reads it instead.
function ReadAloud({ meta }: { meta: LessonMeta }) {
  const [on, setOn] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const canSpeak = 'speechSynthesis' in window
  useEffect(() => () => {
    audio.current?.pause()
    if (canSpeak) speechSynthesis.cancel()
  }, [canSpeak])

  const text = narration(meta)
  const speak = () => {
    if (!canSpeak) return setOn(false)
    const u = new SpeechSynthesisUtterance(text)
    u.onend = () => setOn(false)
    speechSynthesis.speak(u)
  }
  const toggle = () => {
    if (on) {
      audio.current?.pause()
      if (canSpeak) speechSynthesis.cancel()
      return setOn(false)
    }
    setOn(true)
    if ((NARRATED as Record<string, string>)[meta.id] !== text) return speak()
    const a = (audio.current = new Audio(`/audio/${meta.id}.mp3`))
    a.onended = () => setOn(false)
    a.play().catch((e: DOMException) => e.name !== 'AbortError' && speak())
  }
  return (
    <button className="btn-ghost mt-3 text-sm" aria-pressed={on} onClick={toggle}>
      <span aria-hidden>{on ? '\u25A0' : '\u25B6'}</span> {on ? READ.stop : READ.play}
    </button>
  )
}
