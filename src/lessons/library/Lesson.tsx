import { useEffect, useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { BOOKS, LIBRARY as L, fill, UI } from '../../content.ts'
import { generate, loadBooks, seeded, toText, train, words, type Model } from '../guess/logic.ts'
import { animalsIn, topAfter, wins } from './logic.ts'

export default function Library({ onDone }: GameProps) {
  const [texts, setTexts] = useState<string[] | null>(null)
  const [picked, setPicked] = useState<ReadonlySet<number>>(new Set())
  const [model, setModel] = useState<Model | null>(null)
  const [seed, setSeed] = useState(1)

  useEffect(() => {
    loadBooks(BOOKS.map((b) => b.file)).then(setTexts)
  }, [])

  if (!texts) return <p role="status" className="card">{UI.loadingBooks}</p>

  const toggle = (i: number) => {
    const next = new Set(picked)
    if (!next.delete(i)) next.add(i)
    setPicked(next)
  }
  const retrain = () => {
    const m = train([...picked].map((i) => texts[i]).join('\n'))
    setModel(m)
    setSeed(1)
    if (wins(m)) onDone()
  }

  const top = model ? topAfter(model) : []
  const animals = new Set(animalsIn(top))
  const start = words(L.storyStart)
  const story = model && toText([...start, ...generate(model, start, 24, 0.8, seeded(seed))], true)

  return (
    <>
      <p className="rounded-2xl border-2 border-coral bg-abyss p-4 text-xl font-bold">{fill(L.challenge, { goal: L.goal })}</p>
      <section className="card flex flex-col gap-3">
        <p className="text-lg">{L.pick}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {BOOKS.map((b, i) => (
            <button key={b.file} className="chip flex flex-col items-start py-2 text-left" aria-pressed={picked.has(i)} autoFocus={i === 0} onClick={() => toggle(i)}>
              <span className="text-lg font-bold">{b.title}</span>
              <span className="text-sm">{b.author}</span>
            </button>
          ))}
        </div>
        <button className="btn-main self-start text-lg" disabled={!picked.size} onClick={retrain}>{L.train}</button>
        {!picked.size && <p className="text-sm text-sand/70">{L.none}</p>}
      </section>

      {model && (
        <section className="card flex flex-col gap-3" aria-live="polite">
          <p className="text-sand/80">{fill(L.read, { words: model.words.toLocaleString() })}</p>
          <p className="font-bold">{L.topTitle}</p>
          <ol className="flex flex-wrap gap-2">
            {top.map((w) => (
              <li key={w} className={`rounded-lg px-3 py-1 text-lg font-bold ${animals.has(w) ? 'bg-kelp text-abyss' : 'bg-abyss'}`}>
                {w}{animals.has(w) && <span className="sr-only"> {UI.animal}</span>}
              </li>
            ))}
          </ol>
          <p className="text-lg font-bold">{fill(L.meter, { n: animals.size })}</p>
          <p className="font-bold text-glow">{L.storyTitle}</p>
          <p className="rounded-xl border-2 border-line bg-abyss p-4 text-xl leading-relaxed">{story}</p>
          <button className="btn-ghost self-start" onClick={() => setSeed(seed + 1)}>{L.another}</button>
          {animals.size >= L.goal && <p className="text-xl font-bold text-kelp">{L.win}</p>}
          <p className="text-sand/85">{L.why}</p>
        </section>
      )}
    </>
  )
}
