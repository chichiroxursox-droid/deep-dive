import { CHEF } from '../../content.ts'

export type CardId = (typeof CHEF.cards)[number]['id']
export type GoalId = (typeof CHEF.goals)[number]['id']
export type Line = { text: string; funny?: boolean }

// Pip's card is built only from what the prompt says. A missing card means Pip fills the gap with a bland default.
export function cook(cards: ReadonlySet<string>): Line[] {
  const has = (c: CardId) => cards.has(c)
  const o = CHEF.openers
  const opener = has('task') ? (has('who') ? o.cardNamed : o.cardAnon) : has('who') ? o.named : o.anon
  const body: Line[] = CHEF.body[`${has('tone') ? 'funny' : 'plain'}_${has('details') ? 'sharks' : 'generic'}`].slice(0, has('length') ? 2 : 5)
  if (has('example')) body[body.length - 1] = CHEF.signoff
  return [{ text: opener }, ...body]
}

// Stars check the finished card, not the cards picked.
export function stars(lines: Line[]): Record<GoalId, boolean> {
  const all = lines.map((l) => l.text).join(' ')
  return {
    card: /birthday/i.test(all),
    maya: /maya/i.test(all),
    sharks: /shark/i.test(all),
    short: lines.length === 3,
    funny: lines.some((l) => l.funny),
  }
}

export const count = (s: Record<GoalId, boolean>) => Object.values(s).filter(Boolean).length
