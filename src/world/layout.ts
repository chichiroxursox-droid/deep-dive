// The station's floor plan in meters (y is up, the entrance faces +z). Pure data, so tests can check it without three.js.
import { LESSONS, type LessonId } from '../content.ts'

export type Rect = { x0: number; x1: number; z0: number; z1: number }
export type Room = Rect & { id: LessonId; num: number; side: -1 | 1; doorZ: number; console: [number, number]; color: string }
export type Area = LessonId | 'sea' | 'lobby' | 'corridor' | 'deck'

export const WALL_H = 3.4
export const OUTER_X = 14
export const ROOM_D = 8
export const DOOR_W = 2.4
export const LOBBY: Rect = { x0: -OUTER_X, x1: OUTER_X, z0: -8, z1: 0 }
export const SPAWN: [number, number, number] = [0, 1.5, 13]
const COLORS = ['#ff7a59', '#5ef2e6', '#ffd166', '#7ddc8a', '#ff5c8a', '#a78bfa', '#7fb3ff', '#ffb38a']

// Labs alternate left and right down the corridor: 1 left, 2 right, 3 left...
export const ROOMS: Room[] = LESSONS.map((l, i) => {
  const side = i % 2 === 0 ? -1 : 1
  const z1 = LOBBY.z0 - Math.floor(i / 2) * ROOM_D
  const z0 = z1 - ROOM_D
  const [x0, x1] = side < 0 ? [-OUTER_X, -2.5] : [2.5, OUTER_X]
  return { id: l.id, num: l.num, side, x0, x1, z0, z1, doorZ: (z0 + z1) / 2, console: [side * 10.5, (z0 + z1) / 2], color: COLORS[i % COLORS.length] }
})

const lastZ = Math.min(...ROOMS.map((r) => r.z0))
export const CORRIDOR: Rect = { x0: -2.5, x1: 2.5, z0: lastZ, z1: LOBBY.z0 }
export const DECK: Rect = { x0: -6, x1: 6, z0: lastZ - 8, z1: lastZ }
export const LICENSE_POS: [number, number] = [0, DECK.z0 + 3.5]

const inside = (r: Rect, x: number, z: number) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1

export function areaAt(x: number, z: number): Area {
  if (inside(LOBBY, x, z)) return 'lobby'
  if (inside(CORRIDOR, x, z)) return 'corridor'
  if (inside(DECK, x, z)) return 'deck'
  return ROOMS.find((r) => inside(r, x, z))?.id ?? 'sea'
}

// Every wall in the station: a straight line from a to b (x, z), with door gaps, glass or solid.
// Station.tsx draws these and the camera uses them to stay out of walls.
export type Gap = { at: number; w: number; color?: string }
export type WallDef = { a: [number, number]; b: [number, number]; gaps?: Gap[]; glassy?: boolean }

export function walls(): WallDef[] {
  const gapsFor = (side: -1 | 1): Gap[] => ROOMS.filter((r) => r.side === side).map((r) => ({ at: r.doorZ, w: DOOR_W, color: r.color }))
  const open = [{ at: 0, w: CORRIDOR.x1 - CORRIDOR.x0 }]
  const dividers = [...new Set(ROOMS.map((r) => r.z0))].filter((z) => z > CORRIDOR.z0)
  return [
    { a: [-OUTER_X, 0], b: [OUTER_X, 0], glassy: true, gaps: [{ at: 0, w: 3.2, color: '#1d4f7a' }] },
    { a: [-OUTER_X, LOBBY.z0], b: [-OUTER_X, 0], glassy: true },
    { a: [OUTER_X, LOBBY.z0], b: [OUTER_X, 0], glassy: true },
    { a: [-OUTER_X, LOBBY.z0], b: [OUTER_X, LOBBY.z0], gaps: open },
    { a: [CORRIDOR.x0, CORRIDOR.z0], b: [CORRIDOR.x0, CORRIDOR.z1], gaps: gapsFor(-1) },
    { a: [CORRIDOR.x1, CORRIDOR.z0], b: [CORRIDOR.x1, CORRIDOR.z1], gaps: gapsFor(1) },
    ...dividers.map((z): WallDef => ({ a: [-OUTER_X, z], b: [OUTER_X, z], gaps: open })),
    { a: [-OUTER_X, CORRIDOR.z0], b: [-OUTER_X, CORRIDOR.z1], glassy: true },
    { a: [OUTER_X, CORRIDOR.z0], b: [OUTER_X, CORRIDOR.z1], glassy: true },
    { a: [-OUTER_X, CORRIDOR.z0], b: [OUTER_X, CORRIDOR.z0], gaps: open },
    { a: [DECK.x0, DECK.z0], b: [DECK.x0, DECK.z1], glassy: true },
    { a: [DECK.x1, DECK.z0], b: [DECK.x1, DECK.z1], glassy: true },
    { a: [DECK.x0, DECK.z0], b: [DECK.x1, DECK.z0], glassy: true },
  ]
}

// The solid pieces of a wall once its door gaps are cut out: [from, to] along the wall.
export function segments(w: WallDef): [number, number][] {
  const alongX = w.a[1] === w.b[1]
  const [lo, hi] = alongX ? [Math.min(w.a[0], w.b[0]), Math.max(w.a[0], w.b[0])] : [Math.min(w.a[1], w.b[1]), Math.max(w.a[1], w.b[1])]
  const out: [number, number][] = []
  let cur = lo
  for (const g of [...(w.gaps ?? [])].sort((x, y) => x.at - y.at)) {
    out.push([cur, g.at - g.w / 2])
    cur = g.at + g.w / 2
  }
  out.push([cur, hi])
  return out.filter(([a, b]) => b - a > 0.05)
}
