import { useEffect, useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { BOOKS, GUESS as G } from '../../content.ts'
import { fill } from '../tokens/Lesson.tsx'
import { generate, loadBooks, nextWords, seeded, toText, train, words, type Model } from './logic.ts'

export const pct = (p: number) => (p >= 0.1 ? `${Math.round(p * 100)}%` : `${(p * 100).toFixed(1)}%`)

export function Bars({ dist, mine }: { dist: { word: string; p: number }[]; mine?: string }) {
  const top = dist[0]?.p ?? 1
  return (
    <ol className="flex flex-col gap-1.5">
      {dist.map((g) => (
        <li key={g.word} className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-2 text-lg">
          <span className={g.word === mine ? 'font-black text-coral' : 'font-bold'}>{g.word}</span>
          <span className="h-6 rounded-md bg-abyss">
            <span className={`block h-6 rounded-md ${g.word === mine ? 'bg-coral' : 'bg-glow'}`} style={{ width: `${(g.p / top) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{pct(g.p)}</span>
        </li>
      ))}
    </ol>
  )
}

export default function GuessingMachine({ onDone }: GameProps) {
  const [model, setModel] = useState<Model | null>(null)
  const [guess, setGuess] = useState('')
  const [shown, setShown] = useState(false)
  const [temp, setTemp] = useState(0)
  const [story, setStory] = useState<string | null>(null)

  useEffect(() => {
    loadBooks(BOOKS.map((b) => b.file)).then((texts) => setModel(train(texts.join('\n'))))
  }, [])

  if (!model) return <p role="status" className="card">{G.loading}</p>

  const context = words(G.prompt)
  const { dist } = nextWords(model, context)
  const mine = words(guess)[0] ?? ''
  const mineP = dist.find((g) => g.word === mine)?.p
  const ctx = context.slice(-2).join(' ')
  const { t, label } = G.temps[temp]

  const write = () => {
    const start = words(G.start)
    setStory(toText([...start, ...generate(model, start, 40, t, seeded(Date.now()))], true))
    onDone()
  }

  return (
    <>
      <section className="card flex flex-col gap-4">
        <p className="text-sand/80">{fill(G.read, { words: model.words.toLocaleString() })}</p>
        <p className="text-3xl font-black">
          {G.prompt} <span className="text-coral">{shown ? mine || '___' : '___'}</span>
        </p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (mine) setShown(true)
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-lg">{G.ask}</span>
            <input autoFocus className="max-w-xs rounded-xl border-2 border-line bg-abyss px-3 py-2 text-xl" value={guess} maxLength={20} autoComplete="off" onChange={(e) => { setGuess(e.target.value.replace(/[^a-zA-Z']/g, '')); setShown(false) }} />
          </label>
          <div className="flex flex-wrap gap-2">
            {G.suggestions.map((s) => (
              <button type="button" key={s} className="chip" aria-pressed={mine === s} onClick={() => { setGuess(s); setShown(false) }}>{s}</button>
            ))}
          </div>
          <button className="btn-main self-start" disabled={!mine}>{G.reveal}</button>
        </form>
        {shown && (
          <div className="flex flex-col gap-3" aria-live="polite">
            <Bars dist={dist.slice(0, 5)} mine={mine} />
            <p className="text-lg font-bold text-kelp">
              {mineP !== undefined ? fill(G.yours, { word: mine, p: pct(mineP) }) : fill(G.never, { word: mine, context: ctx })}
            </p>
            <p className="text-sand/80">{fill(G.how, { context: ctx })}</p>
          </div>
        )}
      </section>

      {shown && (
        <section className="card flex flex-col gap-4">
          <h3 className="text-2xl font-black">{G.storyTitle}</h3>
          <p className="text-lg">{G.story}</p>
          <label className="flex flex-col gap-2">
            <span className="font-bold">Temperature: <span className="text-coral">{label}</span></span>
            <input type="range" min={0} max={G.temps.length - 1} step={1} value={temp} aria-valuetext={label} className="max-w-md accent-coral" onChange={(e) => setTemp(Number(e.target.value))} />
            <span className="flex max-w-md justify-between text-sm text-sand/70" aria-hidden>
              <span>{G.temps[0].label}</span>
              <span>{G.temps[G.temps.length - 1].label}</span>
            </span>
          </label>
          <ul className="list-disc pl-6 text-sand/80">
            <li>{G.cold}</li>
            <li>{G.hot}</li>
          </ul>
          <button className="btn-main self-start" onClick={write}>{G.write}</button>
          {story && (
            <p aria-live="polite" className="rounded-xl border-2 border-line bg-abyss p-4 text-xl leading-relaxed">
              <span className="mb-1 block text-sm font-bold text-glow">{label}</span>
              {story}
            </p>
          )}
        </section>
      )}
    </>
  )
}
