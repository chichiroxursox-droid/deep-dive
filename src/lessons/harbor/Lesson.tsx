import { useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { HARBOR as H, fill, UI } from '../../content.ts'
import { grade } from './logic.ts'

export default function SafeHarbor({ onDone }: GameProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const results = grade(answers)

  return (
    <>
      <ol className="grid gap-3 sm:grid-cols-2">
        {H.cards.map((c, i) => (
          <li key={c.id} className="card flex flex-col gap-2">
            <fieldset className="flex flex-col gap-2" disabled={checked}>
              <legend className="text-xl font-bold">{c.text}</legend>
              <div className="flex flex-wrap gap-2">
                {H.choices.map((ch) => (
                  <label key={ch.id} className="chip cursor-pointer has-checked:border-coral has-checked:bg-coral has-checked:text-abyss has-focus-visible:outline-3 has-focus-visible:outline-glow">
                    <input type="radio" className="sr-only" name={c.id} value={ch.id} checked={answers[c.id] === ch.id} onChange={() => setAnswers({ ...answers, [c.id]: ch.id })} />
                    {ch.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {checked && <p className={results[i].ok ? 'text-kelp' : 'text-urchin'}><b>{results[i].ok ? '✓' : '✗'}</b> {c.why}</p>}
          </li>
        ))}
      </ol>
      {!checked ? (
        <button className="btn-main self-start text-lg" disabled={!H.cards.every((c) => answers[c.id])} onClick={() => { setChecked(true); onDone() }}>
          {H.check}
        </button>
      ) : (
        <section className="card border-2 border-glow" aria-live="polite">
          <p className="text-2xl font-black" tabIndex={-1} autoFocus>{fill(H.score, { n: results.filter((r) => r.ok).length, total: H.cards.length })}</p>
          <p className="text-lg">{H.lesson}</p>
          <button className="btn-ghost mt-2" onClick={() => { setAnswers({}); setChecked(false) }}>{UI.tryAgain}</button>
        </section>
      )}
    </>
  )
}
