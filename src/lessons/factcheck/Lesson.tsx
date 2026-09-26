import { useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { FACTS as F } from '../../content.ts'
import { fill } from '../tokens/Lesson.tsx'
import { grade, guideEntry } from './logic.ts'

export default function FactCheck({ onDone }: GameProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const results = grade(answers)
  const allMarked = F.claims.every((c) => answers[c.id])

  return (
    <>
      <p className="text-lg">{F.task}</p>

      <details className="card border-2 border-glow">
        <summary className="cursor-pointer text-xl font-black text-glow">{F.guideOpen}</summary>
        <h3 className="sr-only">{F.guideTitle}</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {F.guide.map((g) => (
            <li key={g.id} className="rounded-xl bg-abyss p-3">
              <p className="font-bold">{g.title}</p>
              <p>{g.fact}</p>
              <a className="text-sm text-glow underline" href={g.url} target="_blank" rel="noreferrer">{F.source}: {g.source}</a>
            </li>
          ))}
        </ul>
      </details>

      <ol className="flex flex-col gap-3">
        {F.claims.map((c, i) => {
          const r = results[i]
          const g = guideEntry(c.guide)
          return (
            <li key={c.id} className="card flex flex-col gap-2">
              <fieldset className="flex flex-col gap-2" disabled={checked}>
                <legend className="text-xl font-bold">Pip: "{c.text}"</legend>
                <div className="flex items-center gap-2 text-sm" aria-hidden>
                  <span className="h-3 w-40 rounded-full bg-abyss"><span className="block h-3 w-[99%] rounded-full bg-coral" /></span>
                  <span className="font-bold text-coral">{F.sure}</span>
                </div>
                <p className="sr-only">Pip says it is {F.sure}.</p>
                <div className="flex flex-wrap gap-2">
                  {F.choices.map((ch) => (
                    <label key={ch.id} className="chip cursor-pointer has-checked:border-coral has-checked:bg-coral has-checked:text-abyss has-focus-visible:outline-3 has-focus-visible:outline-glow">
                      <input type="radio" className="sr-only" name={c.id} value={ch.id} checked={answers[c.id] === ch.id} onChange={() => setAnswers({ ...answers, [c.id]: ch.id })} />
                      {ch.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {checked && (
                <p className={r.ok ? 'text-kelp' : 'text-urchin'}>
                  <b>{r.ok ? '✓ Right.' : `✗ The answer is "${F.choices.find((ch) => ch.id === c.answer)!.label}".`}</b> {c.why}{' '}
                  {g && <a className="text-glow underline" href={g.url} target="_blank" rel="noreferrer">{F.source}: {g.source}</a>}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {!checked ? (
        <button
          className="btn-main self-start text-lg"
          disabled={!allMarked}
          onClick={() => {
            setChecked(true)
            onDone()
          }}
        >
          {F.check}
        </button>
      ) : (
        <section className="card border-2 border-glow" aria-live="polite">
          <p className="text-2xl font-black">{fill(F.score, { n: results.filter((r) => r.ok).length, total: F.claims.length })}</p>
          <p className="text-lg">{F.lesson}</p>
          <button className="btn-ghost mt-2" onClick={() => { setAnswers({}); setChecked(false) }}>Try again</button>
        </section>
      )}
    </>
  )
}
