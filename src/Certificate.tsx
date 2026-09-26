import { CORE, LESSONS, LICENSE, UI, type LessonId } from './content.ts'
import { Pip } from './App.tsx'

type Props = { done: ReadonlySet<LessonId>; name: string; onName: (n: string) => void }

// The ending: a Diver's License listing every rule learned. The name lives only in React state.
export default function Certificate({ done, name, onName }: Props) {
  const n = CORE.filter((l) => done.has(l.id)).length
  const all = n === CORE.length
  return (
    <section aria-labelledby="license-title" className="flex flex-col gap-4">
      <div className="rounded-3xl border-4 border-glow bg-gradient-to-br from-panel to-abyss p-6 print:border-black print:bg-none print:text-black">
        <div className="flex flex-wrap items-center gap-4">
          <Pip size={64} />
          <div className="flex-1">
            <p className="text-sm font-bold uppercase tracking-widest text-glow">{UI.station}</p>
            <h2 id="license-title" className="text-3xl font-black">{LICENSE.title}</h2>
          </div>
          <p className="text-4xl font-black text-coral" aria-label={`${n} of ${CORE.length} labs done`}>{n}/{CORE.length}</p>
        </div>
        <p className="mt-4 text-2xl font-bold">
          {UI.diver} <span className="text-glow">{name.trim() || '________'}</span>
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {LESSONS.filter((l) => !l.bonus || done.has(l.id)).map((l) => (
            <li key={l.id} className={done.has(l.id) ? 'text-lg' : 'text-lg text-sand/40'}>
              <span aria-hidden>{done.has(l.id) ? '✓ ' : '○ '}</span>
              <b>{l.bonus ? `${UI.bonus}: ` : ''}{l.title}:</b> {done.has(l.id) ? l.rule : UI.notFinished}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-bold text-kelp">{all ? LICENSE.done : LICENSE.locked}</p>
      </div>
      <label className="flex flex-col gap-1 print:hidden">
        <span className="font-bold">{LICENSE.namePrompt}</span>
        <input
          className="max-w-xs rounded-xl border-2 border-line bg-abyss px-3 py-2 text-lg"
          value={name}
          maxLength={20}
          autoComplete="off"
          onChange={(e) => onName(e.target.value)}
        />
        <span className="text-sm text-sand/70">{LICENSE.nameNote}</span>
      </label>
      <button className="btn-main self-start print:hidden" onClick={() => window.print()}>{LICENSE.print}</button>
    </section>
  )
}
