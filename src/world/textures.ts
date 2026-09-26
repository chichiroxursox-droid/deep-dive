// Every texture in the station is painted on a canvas at runtime, so the 3D world downloads no images.
import * as THREE from 'three'

const cache = new Map<string, THREE.CanvasTexture>()
const FONT = 'ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif'

function paint(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const k = `${key}|${repeat ?? ''}`
  let t = cache.get(k)
  if (!t) {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    draw(c.getContext('2d')!)
    t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    if (repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(...repeat)
    }
    cache.set(k, t)
  }
  return t
}

// Tiny seeded noise so textures look the same every visit.
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

function speckle(g: CanvasRenderingContext2D, w: number, h: number, n: number, alpha: number, seed: number) {
  const r = rng(seed)
  for (let i = 0; i < n; i++) {
    g.fillStyle = r() > 0.5 ? `rgba(255,255,255,${alpha * r()})` : `rgba(0,0,0,${alpha * r()})`
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2)
  }
}

export const tiles = (base: string, repeat: [number, number]) =>
  paint(`tiles-${base}`, 256, 256, (g) => {
    g.fillStyle = base
    g.fillRect(0, 0, 256, 256)
    speckle(g, 256, 256, 1800, 0.08, 7)
    g.strokeStyle = 'rgba(0,0,0,0.18)'
    g.lineWidth = 3
    g.strokeRect(1.5, 1.5, 253, 253)
    g.strokeStyle = 'rgba(255,255,255,0.25)'
    g.lineWidth = 1
    g.strokeRect(4, 4, 248, 248)
  }, repeat)

export const panels = (base: string, repeat: [number, number]) =>
  paint(`panels-${base}`, 256, 256, (g) => {
    g.fillStyle = base
    g.fillRect(0, 0, 256, 256)
    speckle(g, 256, 256, 900, 0.05, 11)
    g.fillStyle = 'rgba(0,0,0,0.12)'
    g.fillRect(0, 0, 3, 256)
    g.fillRect(0, 0, 256, 2)
    g.fillStyle = 'rgba(0,0,0,0.22)'
    for (const [x, y] of [[14, 14], [242, 14], [14, 242], [242, 242]]) {
      g.beginPath()
      g.arc(x, y, 3, 0, Math.PI * 2)
      g.fill()
    }
  }, repeat)

export const sand = (repeat: [number, number]) =>
  paint('sand', 512, 512, (g) => {
    g.fillStyle = '#c9b48a'
    g.fillRect(0, 0, 512, 512)
    speckle(g, 512, 512, 14000, 0.18, 3)
    const r = rng(5)
    g.strokeStyle = 'rgba(120,95,60,0.18)'
    g.lineWidth = 3
    for (let i = 0; i < 26; i++) {
      const y = r() * 512
      g.beginPath()
      g.moveTo(0, y)
      for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x / 40 + i) * 6)
      g.stroke()
    }
  }, repeat)

// Bright wavy light lines, scrolled over the sand to look like sunlight through water.
export const caustics = (repeat: [number, number]) =>
  paint('caustics', 512, 512, (g) => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, 512, 512)
    const r = rng(9)
    g.strokeStyle = 'rgba(190,240,255,0.35)'
    g.lineCap = 'round'
    g.filter = 'blur(2px)'
    for (let i = 0; i < 90; i++) {
      g.lineWidth = 2 + r() * 3
      const x = r() * 512
      const y = r() * 512
      g.beginPath()
      g.moveTo(x, y)
      g.bezierCurveTo(x + r() * 80 - 40, y + r() * 80 - 40, x + r() * 80 - 40, y + r() * 80 - 40, x + r() * 90 - 45, y + r() * 90 - 45)
      g.stroke()
    }
  }, repeat)

export const stripes = (a: string, b: string) =>
  paint(`stripes-${a}-${b}`, 128, 64, (g) => {
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i % 2 ? a : b
      g.fillRect((i * 128) / 6, 0, 128 / 6 + 1, 64)
    }
  })

export type Line = { t: string; size: number; color?: string; bold?: boolean }

function wrap(g: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = []
  let cur = ''
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word
    if (g.measureText(next).width > max && cur) {
      out.push(cur)
      cur = word
    } else cur = next
  }
  out.push(cur)
  return out
}

// A painted sign: lines of wrapped text on a rounded board.
export function sign(lines: Line[], opts: { w?: number; h?: number; bg?: string; border?: string; align?: 'left' | 'center'; key?: string } = {}) {
  const { w = 512, h = 256, bg = '#fff8ec', border = '#1d5580', align = 'center' } = opts
  return paint(`sign-${opts.key ?? ''}-${w}x${h}-${bg}-${border}-${align}-${JSON.stringify(lines)}`, w, h, (g) => {
    g.fillStyle = border
    g.beginPath()
    g.roundRect(0, 0, w, h, 28)
    g.fill()
    g.fillStyle = bg
    g.beginPath()
    g.roundRect(8, 8, w - 16, h - 16, 22)
    g.fill()
    const pad = 36
    const rows: { text: string; l: Line }[] = []
    for (const l of lines) {
      g.font = `${l.bold ? 800 : 600} ${l.size}px ${FONT}`
      for (const text of wrap(g, l.t, w - pad * 2)) rows.push({ text, l })
    }
    const total = rows.reduce((s, r) => s + r.l.size * 1.25, 0)
    let y = (h - total) / 2
    g.textBaseline = 'top'
    g.textAlign = align
    for (const { text, l } of rows) {
      g.font = `${l.bold ? 800 : 600} ${l.size}px ${FONT}`
      g.fillStyle = l.color ?? '#04182b'
      g.fillText(text, align === 'center' ? w / 2 : pad, y)
      y += l.size * 1.25
    }
  })
}

// Colored chunks, like Token Reef, for the wall screen in Lab 1.
export function chunkScreen(title: string, pieces: string[]) {
  return paint(`chunks-${title}-${pieces.join('|')}`, 1024, 512, (g) => {
    g.fillStyle = '#04182b'
    g.fillRect(0, 0, 1024, 512)
    g.fillStyle = '#5ef2e6'
    g.font = `700 52px ${FONT}`
    g.textAlign = 'center'
    g.fillText(title, 512, 110)
    const colors = ['#ff7a59', '#5ef2e6', '#ffd166', '#7ddc8a', '#ff5c8a']
    g.font = `800 110px ui-monospace, Menlo, monospace`
    const widths = pieces.map((p) => g.measureText(p).width + 60)
    let x = 512 - (widths.reduce((s, v) => s + v, 0) + (pieces.length - 1) * 24) / 2
    pieces.forEach((p, i) => {
      g.fillStyle = colors[i % colors.length]
      g.beginPath()
      g.roundRect(x, 200, widths[i], 170, 24)
      g.fill()
      g.fillStyle = '#04182b'
      g.fillText(p, x + widths[i] / 2, 330)
      x += widths[i] + 24
    })
  })
}

// Shared materials, cached by look, so hundreds of meshes reuse a handful of materials.
const mats = new Map<string, THREE.MeshStandardMaterial>()
export function mat(color: string, o: { rough?: number; metal?: number; glow?: number; map?: THREE.Texture; opacity?: number } = {}) {
  const key = `${color}|${o.rough}|${o.metal}|${o.glow}|${o.map?.uuid}|${o.opacity}`
  let m = mats.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.7,
      metalness: o.metal ?? 0,
      emissive: o.glow ? color : '#000000',
      emissiveIntensity: o.glow ?? 0,
      map: o.map ?? null,
      transparent: o.opacity !== undefined,
      opacity: o.opacity ?? 1,
      depthWrite: o.opacity === undefined,
    })
    mats.set(key, m)
  }
  return m
}

export const glass = () => mat('#a8e6ff', { rough: 0.05, metal: 0.2, opacity: 0.16 })
