import { useEffect, useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { TOKENS as T } from '../../content.ts'
import { loadEncoder, split, type Encoder } from './logic.ts'

const COLORS = ['bg-coral', 'bg-glow', 'bg-[#ffd166]', 'bg-kelp', 'bg-urchin']
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k]))

export function Chunks({ enc, text }: { enc: Encoder; text: string }) {
  const pieces = split(enc, text)
  return (
    <ol aria-label={`${pieces.length} ${pieces.length === 1 ? "token" : "tokens"}`} className="flex flex-wrap gap-1.5">
      {pieces.map((p, i) => (
        <li key={i} className={`${COLORS[i % COLORS.length]} flex flex-col items-center rounded-lg px-2 py-1 text-abyss`}>
          <span className="whitespace-pre font-mono text-xl font-bold">{p.text.replaceAll(' ', '·')}</span>
          <span className="text-xs opacity-75">{p.ids.join(' ')}</span>
        </li>
      ))}
    </ol>
  )
}

export default function TokenReef({ onDone }: GameProps) {
  const [enc, setEnc] = useState<Encoder | null>(null)
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const [name, setName] = useState('')
  const [free, setFree] = useState('')

  useEffect(() => {
    loadEncoder().then(setEnc)
  }, [])
  useEffect(() => {
    if (name.trim()) onDone()
  }, [name, onDone])

  if (!enc) return <p role="status" className="card">{T.loading}</p>

  if (round < T.rounds.length) {
    const text = T.rounds[round]
    const n = split(enc, text).length
    const verdict = guess === n ? T.exact : Math.abs((guess ?? 0) - n) === 1 ? T.close : T.off
    return (
      <section key={round} className="card flex flex-col gap-4">
        <p className="text-sm font-bold text-glow">Round {round + 1} of {T.rounds.length}</p>
        <p className="text-3xl font-black">"{text}"</p>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-lg">{T.ask}</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <button key={g} className="chip text-xl" aria-pressed={guess === g} disabled={shown} autoFocus={g === 1} onClick={() => setGuess(g)}>
                {g}
              </button>
            ))}
          </div>
        </fieldset>
        {!shown ? (
          <button className="btn-main self-start" disabled={guess === null} onClick={() => setShown(true)}>{T.show}</button>
        ) : (
          <div className="flex flex-col gap-3" aria-live="polite">
            <Chunks enc={enc} text={text} />
            <p className="text-xl font-bold text-kelp">{verdict} {fill(T.result, { guess: guess!, n })}</p>
            {text === 'strawberry' && (
              <p className="rounded-xl border-2 border-coral p-3 text-lg">
                {T.strawberry} <b>{fill(T.letters, { letters: [...text].length, n })}</b>
              </p>
            )}
            {round === 0 && <p className="text-sand/80">{T.numbers}</p>}
            {round === 2 && <p className="text-sand/80">{T.space}</p>}
            <button
              className="btn-main self-start"
              autoFocus
              onClick={() => {
                setRound(round + 1)
                setGuess(null)
                setShown(false)
              }}
            >
              {T.next}
            </button>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="card flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-xl font-bold">{T.name}</span>
        <input autoFocus className="max-w-sm rounded-xl border-2 border-line bg-abyss px-3 py-2 text-xl" placeholder={T.namePlaceholder} value={name} maxLength={40} autoComplete="off" onChange={(e) => setName(e.target.value)} />
      </label>
      {name && <Chunks enc={enc} text={name} />}
      <label className="flex flex-col gap-2">
        <span className="text-lg">{T.free}</span>
        <input className="rounded-xl border-2 border-line bg-abyss px-3 py-2 text-xl" value={free} maxLength={120} autoComplete="off" onChange={(e) => setFree(e.target.value)} />
      </label>
      {free && <Chunks enc={enc} text={free} />}
    </section>
  )
}
