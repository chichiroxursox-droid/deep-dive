import { useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { TOOLBOX as T } from '../../content.ts'
import { fill } from '../tokens/Lesson.tsx'
import { answer, judge, snackTotal, type ToolId } from './logic.ts'

const vars = { divers: T.divers, price: T.price, total: snackTotal() }

export default function Toolbox({ onDone }: GameProps) {
  const [picks, setPicks] = useState<Record<string, ToolId>>({})
  const [steps, setSteps] = useState<(boolean | undefined)[]>([])
  const [over, setOver] = useState<string | null>(null)
  const allRight = T.jobs.every((j) => picks[j.id] === j.tool)
  const verdicts = judge(steps)
  const decided = steps.filter((s) => s !== undefined).length === T.steps.length

  const decide = (i: number, yes: boolean) => {
    const next = [...steps]
    next[i] = yes
    setSteps(next)
    if (next.filter((s) => s !== undefined).length === T.steps.length && judge(next).every(Boolean)) onDone()
  }

  return (
    <>
      <p className="text-lg">{T.task}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Tools">
        {T.tools.map((t) => (
          <li key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)} className="card cursor-grab border-2 border-line px-3 py-2" title={t.about}>
            <span aria-hidden>{t.icon}</span> <b>{t.label}</b> <span className="text-sm text-sand/70">{t.about}</span>
          </li>
        ))}
      </ul>

      <ol className="grid gap-3 md:grid-cols-2">
        {T.jobs.map((j) => {
          const pick = picks[j.id]
          const a = pick && answer(j.id, pick)
          return (
            <li
              key={j.id}
              className={`card flex flex-col gap-2 border-2 ${over === j.id ? 'border-glow' : 'border-transparent'}`}
              onDragOver={(e) => { e.preventDefault(); setOver(j.id) }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault()
                setOver(null)
                // Anything can be dropped here (dragged text, links), so only accept a real tool id.
                const id = e.dataTransfer.getData('text/plain')
                if (T.tools.some((t) => t.id === id)) setPicks({ ...picks, [j.id]: id as ToolId })
              }}
            >
              <p className="text-xl font-bold">{j.text}</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Tool for: ${j.text}`}>
                {T.tools.map((t) => (
                  <button key={t.id} className="chip text-sm" aria-pressed={pick === t.id} onClick={() => setPicks({ ...picks, [j.id]: t.id })}>
                    <span aria-hidden>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
              {a && (
                <div aria-live="polite" className="flex flex-col gap-1">
                  <p className="rounded-xl bg-abyss p-2">Pip: {a.text}</p>
                  <p className={a.right ? 'font-bold text-kelp' : 'font-bold text-urchin'}>
                    {a.right ? T.right : T.wrong} <span className="font-normal text-sand/85">{a.right ? ('rightNote' in j ? j.rightNote : '') : j.wrongWhy}</span>
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {allRight && (
        <section className="card flex flex-col gap-3 border-2 border-glow">
          <h3 className="text-2xl font-black">{T.agentTitle}</h3>
          <p className="text-lg">{fill(T.agentGoal, vars)}</p>
          <p>{T.agentAsk}</p>
          <ol className="flex flex-col gap-2">
            {T.steps.map((s, i) => (
              <li key={i} className={`flex flex-wrap items-center gap-2 rounded-xl border-2 p-2 ${decided && !verdicts[i] ? 'border-urchin' : 'border-line'}`}>
                <span className="flex-1 text-lg">Step {i + 1}: {fill(s.text, vars)}</span>
                <button className="chip" aria-pressed={steps[i] === true} onClick={() => decide(i, true)}>{T.yes}</button>
                <button className="chip" aria-pressed={steps[i] === false} onClick={() => decide(i, false)}>{T.no}</button>
                {s.tool === 'send' && steps[i] !== undefined && <span className="w-full text-sand/85">{T.sendWhy}</span>}
              </li>
            ))}
          </ol>
          {decided && (
            <p aria-live="polite" className={`text-lg font-bold ${verdicts.every(Boolean) ? 'text-kelp' : 'text-urchin'}`}>
              {verdicts.every(Boolean) ? fill(T.agentDone, vars) : T.agentOops}
            </p>
          )}
        </section>
      )}
    </>
  )
}
