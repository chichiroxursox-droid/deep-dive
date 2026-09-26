import { LIBRARY as L } from '../../content.ts'
import { nextWords, type Model } from '../guess/logic.ts'

// What Pip guesses right after "the": a quick look at what its books talk about most.
export const topAfter = (m: Model, word = 'the', k = 10) => nextWords(m, [word]).dist.slice(0, k).map((g) => g.word)
export const animalsIn = (words: string[]) => words.filter((w) => L.animals.includes(w))
export const wins = (m: Model) => animalsIn(topAfter(m)).length >= L.goal
