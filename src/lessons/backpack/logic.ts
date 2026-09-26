// The context window as a backpack: messages go in until it's full, then the oldest unpinned one falls out.

export const CAPACITY = 60

export type Item = { id: number; text: string; tokens: number }
export type Pack = { items: Item[]; dropped: Item[]; tossed: Item[]; pinned: number | null }

export const empty = (): Pack => ({ items: [], dropped: [], tossed: [], pinned: null })
export const used = (items: Item[]) => items.reduce((s, x) => s + x.tokens, 0)

export function add(pack: Pack, item: Item, capacity = CAPACITY): Pack {
  const items = [...pack.items, item]
  const dropped = [...pack.dropped]
  while (used(items) > capacity) {
    const i = items.findIndex((x) => x.id !== pack.pinned)
    if (i < 0) break
    dropped.push(...items.splice(i, 1))
  }
  return { ...pack, items, dropped }
}

export function toss(pack: Pack, id: number): Pack {
  const item = pack.items.find((x) => x.id === id)
  if (!item) return pack
  return { ...pack, items: pack.items.filter((x) => x.id !== id), tossed: [...pack.tossed, item], pinned: pack.pinned === id ? null : pack.pinned }
}

// Only one pin at a time. Pinning the pinned item unpins it.
export const pin = (pack: Pack, id: number): Pack => ({ ...pack, pinned: pack.pinned === id ? null : id })
