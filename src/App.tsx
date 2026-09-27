import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { BOOKS, CORE, fill, HALL, LESSONS, narration, READ, SAFETY, START, UI, type LessonId, type LessonMeta } from './content.ts'
import NARRATED from './narration.json'
import MapMode from './MapMode.tsx'
import Certificate from './Certificate.tsx'
import { Loading, LoadingLab, Porthole } from './Porthole.tsx'
import type { Station } from './world/World.tsx'

export type GameProps = { onDone: () => void }

// If a chunk can't download (the internet dropped), show a message instead of a blank page.
function safe<P>(load: () => Promise<{ default: ComponentType<P> }>, Failed: ComponentType<P>) {
  return lazy(() => load().catch(() => ({ default: Failed })))
}
const Failed = () => <p className="card">{UI.loadFailed}</p>

// Map mode never downloads three.js: the 3D world is its own lazy chunk.
const World = safe(() => import('./world/World.tsx'), ({ onMap }) => (
  <div className="flex flex-col items-start gap-3 p-8">
    <Failed />
    <button className="btn-main" onClick={onMap}>{UI.mapMode}</button>
  </div>
))
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
  Object.entries(LOADERS).map(([id, load]) => [id, safe(load, Failed)]),
)

// Fetch every lab, the tokenizer and the books in the background, so the app keeps working offline once loaded.
function prefetch() {
  const quiet = () => {}
  Object.values(LOADERS).forEach((load) => load().catch(quiet))
  import('./lessons/tokens/logic.ts').then((m) => m.loadEncoder()).catch(quiet)
  import('./lessons/guess/logic.ts').then((m) => m.loadModel(BOOKS.map((b) => b.file))).catch(quiet)
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
          <Suspense fallback={<Loading label={START.scene} />}>
            <World paused={open !== null} done={done} onOpen={setOpen} onMap={() => setMode('map')} />
          </Suspense>
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

// A porthole onto the station: the kid sees where they are going before they choose how to get there.
function Start({ onPick }: { onPick: (m: 'hall' | 'map') => void }) {
  const hint = !hasWebGL ? START.noWebGL : touch ? START.touch : reducedMotion ? START.calm : START.mapHint
  // Phones and computers without 3D get Map mode as the big coral button.
  const mapFirst = touch || !hasWebGL
  const main = 'btn-main hatch'
  const ghost = 'btn-ghost hatch border-b-[5px] bg-abyss active:border-b-2'
  return (
    <main className="hull min-h-full">
      <div className="mx-auto grid min-h-dvh max-w-7xl content-center items-center gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="relative order-1 mx-auto w-[min(84vw,44vh)] pt-10 lg:order-2 lg:w-[min(100%,74vh)] lg:pt-0">
          <Porthole label={START.scene} />
          <p className="pip-bubble absolute top-0 left-[-2%] max-w-[13rem] text-sm sm:text-base lg:top-[4%] lg:left-[-6%] lg:max-w-[16rem] lg:text-lg">
            {START.pip}
            <span className="absolute -bottom-[11px] left-[38%] size-4 rotate-45 border-r-3 border-b-3 border-glow bg-sand" aria-hidden />
          </p>
        </div>
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <div className="flex flex-col gap-3">
            <h1 className="text-[clamp(3.75rem,9vw,6rem)] leading-[0.9] font-black tracking-[-0.03em] text-balance">{START.title}</h1>
            <p className="max-w-[26ch] text-xl text-sand/90 sm:text-2xl">{START.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={`${mapFirst ? ghost : main} flex-1 px-7 py-4 text-xl whitespace-nowrap sm:flex-none sm:text-2xl`} disabled={!hasWebGL} onClick={() => onPick('hall')} autoFocus={hasWebGL && !reducedMotion && !touch}>
              <DiveIcon />
              {START.dive}
            </button>
            <button className={`${mapFirst ? main : ghost} flex-1 px-7 py-4 text-xl whitespace-nowrap sm:flex-none sm:text-2xl`} onClick={() => onPick('map')} autoFocus={!hasWebGL || reducedMotion || touch}>
              <MapIcon />
              {START.map}
            </button>
          </div>
          <p className="max-w-[60ch] text-sand/80">{hint}</p>
          <section className="plaque max-w-xl px-6 py-5" aria-label={START.teacherBox}>
            {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((c) => <span key={c} className={`plaque-rivet ${c}`} aria-hidden />)}
            <p className="font-bold text-glow">{SAFETY}</p>
            <p className="mt-1 text-sand/80">{START.teachers}</p>
          </section>
        </div>
      </div>
    </main>
  )
}

// A diver's arrow going down through the waves.
function DiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 6c2.5-2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 0" />
      <path d="M12 10v11M7.5 16.5 12 21l4.5-4.5" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </svg>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="overlay-title" className="m-auto max-h-[94vh] w-[min(58rem,96vw)] rounded-3xl border-2 border-line bg-deep p-0 text-sand">
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        {children}
        <button className="btn-ghost self-start print:hidden" onClick={() => ref.current?.close()}>{UI.back}</button>
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
          <h2 id="overlay-title" className="text-3xl font-black">{meta.title}</h2>
          <p className="mt-1 text-xl font-bold text-coral">{meta.rule}</p>
          <div className="mt-2 space-y-1 text-lg">{meta.intro.map((s) => <p key={s}>{s}</p>)}</div>
          <ReadAloud meta={meta} />
        </div>
      </header>
      {Game ? (
        <Suspense fallback={<LoadingLab />}>
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
