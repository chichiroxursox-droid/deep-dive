import { HARBOR } from '../../content.ts'

export const grade = (answers: Record<string, string | undefined>) => HARBOR.cards.map((c) => ({ id: c.id, ok: answers[c.id] === c.answer }))
