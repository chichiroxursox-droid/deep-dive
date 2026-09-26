import { LESSONS, LICENSE, SAFETY, START, type LessonId } from './content.ts'
import type { Station } from './world/World.tsx'
import { Pip } from './App.tsx'

type Props = { done: ReadonlySet<LessonId>; onOpen: (s: Station) => void; on3D?: () => void }

// Every lab as a plain list: no 3D, keyboard only, same overlays as the hall.
export default function MapMode({ done, onOpen, on3D }: Props) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-5 sm:p-8">
      <header className="flex flex-wrap items-center gap-4">
        <Pip size={56} />
        <div className="flex-1">
          <h1 className="text-3xl font-black text-glow">{START.title}: Station Map</h1>
          <p>Pick a lab. Use Tab to move and Enter to open.</p>
        </div>
        {on3D && <button className="btn-ghost" onClick={on3D}>Walk the 3D station</button>}
      </header>
      <ol className="flex flex-col gap-3">
        {LESSONS.map((l) => (
          <li key={l.id}>
            <button className="card flex w-full items-center gap-4 border-2 border-line text-left hover:border-glow" onClick={() => onOpen(l.id)}>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-coral text-2xl font-black text-abyss" aria-hidden>{l.num}</span>
              <span className="flex-1">
                <span className="block text-xl font-bold">Lab {l.num}: {l.title}</span>
                <span className="block text-sand/80">{l.rule}</span>
              </span>
              <span className={done.has(l.id) ? 'font-bold text-kelp' : 'text-sand/60'}>{done.has(l.id) ? '✓ Done' : 'Not yet'}</span>
            </button>
          </li>
        ))}
        <li>
          <button className="card flex w-full items-center gap-4 border-2 border-coral text-left" onClick={() => onOpen('license')}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-glow text-2xl text-abyss" aria-hidden>{'★'}</span>
            <span className="flex-1">
              <span className="block text-xl font-bold">{LICENSE.title}</span>
              <span className="block text-sand/80">Labs done: {done.size} of {LESSONS.length}</span>
            </span>
          </button>
        </li>
      </ol>
      <p className="text-sm text-sand/70">{SAFETY}</p>
    </main>
  )
}
