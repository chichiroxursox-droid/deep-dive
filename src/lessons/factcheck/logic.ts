import { FACTS } from '../../content.ts'

export type Verdict = (typeof FACTS.choices)[number]['id']

export const guideEntry = (id?: string) => FACTS.guide.find((g) => g.id === id)

export function grade(answers: Record<string, string | undefined>) {
  return FACTS.claims.map((c) => ({ id: c.id, ok: answers[c.id] === c.answer }))
}
