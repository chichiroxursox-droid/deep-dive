import { useState } from 'react'
import type { GameProps } from '../../App.tsx'
import { CHEF as C } from '../../content.ts'
import { cook, count, stars, type Line } from './logic.ts'

export default function RobotChef({ onDone }: GameProps) {
  const [cards, setCards] = useState<ReadonlySet<string>>(new Set())
  const [dish, setDish] = useState<{ lines: Line[]; example: boolean } | null>(null)

  const toggle = (id: string) => {
    const next = new Set(cards)
    if (!next.delete(id)) next.add(id)
    setCards(next)
  }
  const serve = () => {
    const lines = cook(cards)
    setDish({ lines, example: cards.has('example') })
    if (count(stars(lines)) === C.goals.length) onDone()
  }
  const picked = C.cards.filter((c) => cards.has(c.id))
  const got = dish && stars(dish.lines)
  const n = got ? count(got) : 0

  return (
    <>
      <p className="rounded-2xl border-2 border-coral bg-abyss p-4 text-2xl font-black">{C.goal}</p>
      <section className="card flex flex-col gap-3">
        <p className="text-lg">{C.build}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {C.cards.map((c, i) => (
            <button key={c.id} className="chip flex flex-col items-start py-2 text-left" aria-pressed={cards.has(c.id)} autoFocus={i === 0} onClick={() => toggle(c.id)}>
              <span className="text-sm uppercase tracking-wider">{c.label}</span>
              <span className="text-lg">{c.text}</span>
            </button>
          ))}
        </div>
        <div>
          <p className="font-bold text-glow">{C.prompt}</p>
          <p className="rounded-xl bg-abyss p-3 font-mono">{picked.length ? picked.map((c) => c.text).join(' ') : C.emptyPrompt}</p>
        </div>
        <button className="btn-main self-start text-lg" onClick={serve}>{C.cook}</button>
      </section>

      {dish && got && (
        <section className="card flex flex-col gap-3" aria-live="polite">
          <p className="font-bold text-glow">{C.output}</p>
          <div className="rounded-xl bg-sand p-4 text-xl text-abyss">
            {dish.lines.map((l, i) => <p key={i}>{l.text}</p>)}
          </div>
          <p className="text-3xl text-[#ffd166]" aria-label={`${n} of ${C.goals.length} stars`}>
            {'★'.repeat(n)}<span className="text-sand/30">{'★'.repeat(C.goals.length - n)}</span>
          </p>
          <ul className="flex flex-col gap-1 text-lg">
            {C.goals.map((g) => (
              <li key={g.id} className={got[g.id] ? 'text-kelp' : 'text-urchin'}>
                {got[g.id] ? '✓ ' + g.label : '✗ ' + g.miss}
              </li>
            ))}
          </ul>
          {dish.example && <p className="text-sand/80">{C.example}</p>}
          {n === C.goals.length && <p className="text-xl font-bold text-kelp">{C.win}</p>}
        </section>
      )}
    </>
  )
}
