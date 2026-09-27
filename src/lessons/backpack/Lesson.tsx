import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { BACKPACK as B, fill, UI } from '../../content.ts'
import { countTokens, loadEncoder, type Encoder } from '../tokens/logic.ts'
import { add, CAPACITY, empty, pin, toss, used } from './logic.ts'

const ALL = [...B.chat, { from: 'you', text: B.question }]

export default function Backpack({ onDone }: GameProps) {
  const [enc, setEnc] = useState<Encoder | null>(null)
  const [pack, setPack] = useState(empty)
  const [step, setStep] = useState(0)
  const [news, setNews] = useState('')
  const main = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    loadEncoder().then(setEnc)
  }, [])

  if (!enc) return <p role="status" className="card">{UI.loadingTokenizer}</p>

  const asked = step === ALL.length
  const found = pack.items.some((x) => x.id === 0)
  const inPack = new Set(pack.items.map((x) => x.id))
  const fell = new Set(pack.dropped.map((x) => x.id))

  const deliver = () => {
    const m = ALL[step]
    const next = add(pack, { id: step, text: m.text, tokens: countTokens(enc, m.text) })
    setNews(next.dropped.slice(pack.dropped.length).map((f) => fill(B.fellNow, { text: f.text })).join(' '))
    setPack(next)
    setStep(step + 1)
    if (step === ALL.length - 1 && next.items.some((x) => x.id === 0)) onDone()
  }
  const reset = () => {
    setPack(empty())
    setStep(0)
    setNews('')
  }
  const pct = Math.min(100, (used(pack.items) / CAPACITY) * 100)

  return (
    <>
      <p className="text-lg">{B.goal} <span className="text-glow">{B.tip}</span></p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card flex flex-col gap-2" aria-label={UI.chat}>
          <h3 className="text-xl font-black">{UI.chat}</h3>
          {step === 0 && <p className="text-sand/60">{UI.noMessages}</p>}
          <ol className="flex flex-col gap-2">
            {ALL.slice(0, step).map((m, i) => (
              <li
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.from === 'you' ? 'self-end' : 'self-start'} ${!inPack.has(i) ? 'border-2 border-dashed border-sand/60 text-sand' : m.from === 'you' ? 'bg-coral text-abyss' : 'bg-glow text-abyss'}`}
              >
                <span className="sr-only">{m.from === 'you' ? UI.you : UI.pip}: </span>
                {m.text}
                {!inPack.has(i) && <span className="block text-xs font-bold">{fell.has(i) ? UI.fellOut : UI.tossed}</span>}
              </li>
            ))}
          </ol>
        </section>

        <section className="card flex flex-col gap-3" aria-label={B.pack}>
          <h3 className="text-xl font-black">{B.pack}</h3>
          <div>
            <div className="h-5 rounded-full bg-abyss" role="meter" aria-valuemin={0} aria-valuemax={CAPACITY} aria-valuenow={used(pack.items)} aria-label="Backpack space used">
              <div className={`h-5 rounded-full ${pct > 85 ? 'bg-urchin' : 'bg-kelp'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-sm">{fill(B.meter, { used: used(pack.items), cap: CAPACITY })}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {pack.items.map((x) => (
              <li key={x.id} className={`flex flex-wrap items-center gap-2 rounded-xl border-2 p-2 ${pack.pinned === x.id ? 'border-coral' : 'border-line'}`}>
                <span className="flex-1">{x.text}</span>
                <span className="rounded-md bg-abyss px-2 text-sm tabular-nums">{x.tokens} {UI.tokens}</span>
                <button className="chip text-sm" aria-pressed={pack.pinned === x.id} onClick={() => setPack(pin(pack, x.id))} disabled={asked}>
                  {pack.pinned === x.id ? B.unpin : B.pin}
                </button>
                <button
                  className="chip text-sm"
                  disabled={asked}
                  onClick={() => {
                    setPack(toss(pack, x.id))
                    main.current?.focus()
                  }}
                >
                  {B.toss}
                </button>
              </li>
            ))}
          </ul>
          {pack.dropped.length > 0 && (
            <p className="text-sm text-sand/70">
              <b>{B.fell}</b> {pack.dropped.map((x) => `"${x.text}"`).join(', ')}
            </p>
          )}
        </section>
      </div>

      <p aria-live="polite" className="min-h-6 font-bold text-urchin">{news}</p>

      {asked && (
        <section className="card flex flex-col gap-2 border-2 border-glow" aria-live="polite">
          <p className="text-2xl font-black">{UI.pip}: {found ? B.right : B.wrong}</p>
          <p className="text-lg">{found ? B.rightWhy : B.wrongWhy}</p>
          <p className="text-sand/80">{B.real}</p>
        </section>
      )}

      <button ref={main} className="btn-main self-start text-lg" onClick={asked ? reset : deliver}>
        {asked ? B.again : step < B.chat.length ? B.next : B.ask}
      </button>
    </>
  )
}
