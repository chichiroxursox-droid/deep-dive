import { CORE, fill, LESSONS, LICENSE, SAFETY, START, UI, type LessonId, type LessonMeta } from './content.ts'
import type { Station } from './world/World.tsx'
import { Pip } from './App.tsx'

type Props = { done: ReadonlySet<LessonId>; onOpen: (s: Station) => void; on3D?: () => void }

// Every lab as a plain list: no 3D, keyboard only, same overlays as the hall.
export default function MapMode({ done, onOpen, on3D }: Props) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-5 sm:p-8 print:hidden">
      <header className="flex flex-wrap items-center gap-4">
        <Pip size={56} />
        <div className="flex-1">
          <h1 className="text-3xl font-black text-glow">{START.title}: {UI.mapTitle}</h1>
          <p>{UI.mapHelp}</p>
        </div>
        {on3D && <button className="btn-ghost" onClick={on3D}>{UI.walk3D}</button>}
      </header>
      <ol className="flex flex-col gap-3">
        {CORE.map((l) => <Row key={l.id} l={l} done={done.has(l.id)} onOpen={onOpen} />)}
        <li>
          <button className="card flex w-full items-center gap-4 border-2 border-coral text-left" onClick={() => onOpen('license')}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-glow text-2xl text-abyss" aria-hidden>{'\u2605'}</span>
            <span className="flex-1">
              <span className="block text-xl font-bold">{LICENSE.title}</span>
              <span className="block text-sand/80">{fill(UI.labsDone, { n: CORE.filter((l) => done.has(l.id)).length, total: CORE.length })}</span>
            </span>
          </button>
        </li>
      </ol>
      {LESSONS.some((l) => l.bonus) && (
        <>
          <h2 className="text-2xl font-black text-glow">{UI.bonusLabs}</h2>
          <ol className="flex flex-col gap-3">
            {LESSONS.filter((l) => l.bonus).map((l) => <Row key={l.id} l={l} done={done.has(l.id)} onOpen={onOpen} />)}
          </ol>
        </>
      )}
      <p className="text-sm text-sand/70">{SAFETY}</p>
    </main>
  )
}

function Row({ l, done, onOpen }: { l: LessonMeta; done: boolean; onOpen: (s: Station) => void }) {
  return (
    <li>
      <button className="card flex w-full items-center gap-4 border-2 border-line text-left hover:border-glow" onClick={() => onOpen(l.id)}>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-coral text-2xl font-black text-abyss" aria-hidden>{l.num}</span>
        <span className="flex-1">
          <span className="block text-xl font-bold">{l.bonus ? UI.bonusLab : UI.lab} {l.num}: {l.title}</span>
          <span className="block text-sand/80">{l.rule}</span>
        </span>
        <span className={done ? 'font-bold text-kelp' : 'text-sand/60'}>{done ? `\u2713 ${UI.done}` : UI.notYet}</span>
      </button>
    </li>
  )
}
