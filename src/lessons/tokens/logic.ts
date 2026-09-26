import type { Tiktoken } from 'js-tiktoken/lite'

export type Encoder = Pick<Tiktoken, 'encode' | 'decode'>
export type Piece = { text: string; ids: number[] }

let loading: Promise<Encoder> | undefined

// The o200k_base ranks (the GPT-4o tokenizer) are about 2 MB, so they load only when a lab needs them.
export function loadEncoder(): Promise<Encoder> {
  return (loading ??= Promise.all([import('js-tiktoken/lite'), import('js-tiktoken/ranks/o200k_base')]).then(
    ([{ Tiktoken }, ranks]) => new Tiktoken(ranks.default),
  ))
}

// The tokenizer's real pieces. One emoji can span several tokens whose bytes only make
// a character together, so ids are grouped until they decode to exactly the next stretch of the
// original text. (A half-built character decodes to "�", which never matches the source, while
// a real "�" typed by the kid does, so it can't swallow the words after it.)
export function split(enc: Encoder, text: string): Piece[] {
  const pieces: Piece[] = []
  let pending: number[] = []
  let at = 0
  for (const id of enc.encode(text)) {
    pending.push(id)
    const s = enc.decode(pending)
    if (text.startsWith(s, at)) {
      pieces.push({ text: s, ids: pending })
      at += s.length
      pending = []
    }
  }
  if (pending.length) pieces.push({ text: enc.decode(pending), ids: pending })
  return pieces
}

export const countTokens = (enc: Encoder, text: string) => enc.encode(text).length
