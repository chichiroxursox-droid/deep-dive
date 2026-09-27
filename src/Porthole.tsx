// The start and loading screens look out of a sub's porthole at Deep Dive Station on the sea floor.
// Inline SVG and CSS only (no downloads), so Map mode players pay almost nothing for it.
import { useEffect, useState, type CSSProperties } from 'react'
import { CORE, HALL, UI } from './content.ts'
import { ROOMS } from './world/layout.ts'

const KELP = [
  { x: 26, h: 170, d: 0 },
  { x: 54, h: 116, d: 1.3 },
  { x: 356, h: 190, d: 0.6 },
  { x: 384, h: 128, d: 1.9 },
]
const BUBBLES = [
  { x: 118, r: 4, d: 0 },
  { x: 132, r: 2.5, d: 1.4 },
  { x: 244, r: 5, d: 0.7 },
  { x: 262, r: 3, d: 2.6 },
  { x: 318, r: 3.5, d: 1.9 },
  { x: 90, r: 3, d: 3.3 },
  { x: 200, r: 2.5, d: 2.2 },
]
const FISH = [
  [0, 0, 1],
  [16, -9, 0.8],
  [20, 9, 0.9],
  [36, -2, 0.75],
  [-14, 10, 0.7],
]
// Lab windows: 4 left of the airlock, 4 right, lit in each lab's color from the station's floor plan.
const WINDOWS = ROOMS.map((r, i) => ({ x: i < 4 ? 80 + i * 26 : 222 + (i - 4) * 26, color: r.color }))

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` })

function Scene({ sinking }: { sinking: boolean }) {
  return (
    <svg viewBox="0 0 400 400" className="block size-full" aria-hidden>
      <defs>
        <linearGradient id="pw-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b8fbc" />
          <stop offset="0.55" stopColor="#0d527a" />
          <stop offset="1" stopColor="#062a45" />
        </linearGradient>
        <linearGradient id="pw-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9c7ae" />
          <stop offset="1" stopColor="#6d8a8c" />
        </linearGradient>
        <filter id="pw-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <rect width="400" height="400" fill="url(#pw-water)" />
      <g className="pw-rays" fill="#fff">
        <polygon points="58,0 104,0 196,400 96,400" opacity="0.07" />
        <polygon points="196,0 232,0 300,400 226,400" opacity="0.05" />
        <polygon points="300,0 326,0 384,400 334,400" opacity="0.06" />
      </g>
      <g className="pw-fish" fill="#ffd166">
        {FISH.map(([dx, dy, s], i) => (
          <g key={i} transform={`translate(${250 + dx} ${104 + dy}) scale(${s})`}>
            <ellipse rx="7" ry="3.6" />
            <polygon points="-6,0 -12,-4 -12,4" />
          </g>
        ))}
      </g>

      {/* the station and the sea floor rise into view as the loading screen sinks */}
      <g className="pw-scene">
        <path d="M0 282 Q44 262 88 278 T168 272 T248 280 T328 266 T400 280 V400 H0Z" fill="#0c3d5e" />
        <rect x="58" y="284" width="284" height="9" rx="2" fill="#5d7483" />
        <rect x="70" y="236" width="260" height="50" rx="4" fill="#dfe9ef" />
        <rect x="66" y="229" width="268" height="9" rx="3" fill="#1d4f7a" />
        <rect x="70" y="276" width="260" height="10" fill="#1d4f7a" />
        <g filter="url(#pw-soft)" opacity="0.75">
          {WINDOWS.map((w) => <rect key={w.x} x={w.x - 2} y="244" width="24" height="26" rx="4" fill={w.color} />)}
          <rect x="184" y="242" width="32" height="44" rx="12" fill="#fff6df" />
        </g>
        {WINDOWS.map((w) => (
          <g key={w.x}>
            <rect x={w.x} y="246" width="20" height="22" rx="3" fill={w.color} />
            <rect x={w.x + 3} y="248" width="5" height="18" rx="2" fill="#fff" opacity="0.35" />
          </g>
        ))}
        <rect x="186" y="244" width="28" height="42" rx="11" fill="#fff6df" />
        <rect x="178" y="238" width="44" height="5" rx="2" fill="#1d4f7a" />
        <rect x="184" y="225" width="32" height="10" rx="2" fill="#1d4f7a" stroke="#e8b04a" strokeWidth="1.4" />
        <line x1="306" y1="229" x2="306" y2="210" stroke="#dfe9ef" strokeWidth="2" />
        <circle className="pw-beacon" cx="306" cy="208" r="3.6" fill="#ff7a59" />
        <path d="M0 300 Q60 288 120 296 T240 292 T400 298 V400 H0Z" fill="url(#pw-sand)" />
        <ellipse cx="338" cy="318" rx="28" ry="12" fill="#4f6a77" />
        <ellipse cx="326" cy="313" rx="14" ry="7" fill="#5f7c89" />
        <ellipse cx="70" cy="334" rx="20" ry="9" fill="#4f6a77" />
        {[
          [248, 306, 8, '#ff7a59'],
          [262, 309, 6, '#ff7aa0'],
          [150, 312, 7, '#ffd166'],
          [160, 306, 5, '#a78bfa'],
        ].map(([cx, cy, r, c]) => <circle key={`${cx}`} cx={cx} cy={cy} r={r} fill={c as string} />)}
      </g>
      {sinking && <rect className="pw-deeper" width="400" height="400" fill="#04182b" opacity="0.3" />}

      {KELP.map((k) => (
        <g key={k.x} className="pw-kelp" style={{ transformOrigin: `${k.x}px 400px`, ...delay(-k.d) }}>
          <path d={`M${k.x} 400 C${k.x - 12} ${400 - k.h * 0.4} ${k.x + 12} ${400 - k.h * 0.7} ${k.x} ${400 - k.h}`} stroke="#3f7d3a" strokeWidth="5" fill="none" strokeLinecap="round" />
          {Array.from({ length: Math.floor(k.h / 34) }, (_, j) => (
            <ellipse key={j} cx={k.x + (j % 2 ? 9 : -9)} cy={400 - 26 - j * 34} rx="10" ry="4.5" fill={j % 2 ? '#5a9c45' : '#4c8b3d'} transform={`rotate(${j % 2 ? -30 : 30} ${k.x + (j % 2 ? 9 : -9)} ${400 - 26 - j * 34})`} />
          ))}
        </g>
      ))}

      {BUBBLES.map((b) => (
        <circle key={b.x} className="pw-bubble" cx={b.x} cy="392" r={b.r} fill="#fff" fillOpacity="0.14" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" style={delay(b.d)} />
      ))}

      {/* Pip, floating right by the glass, waving */}
      <g transform="translate(46 112) scale(1.6)">
        <g className="pw-pip">
          <ellipse cx="32" cy="60" rx="10" ry="3.5" fill="#1d4f7a" />
          <rect className="pw-wave" x="52" y="29" width="17" height="7" rx="3.5" fill="#5ef2e6" />
          <rect x="-5" y="33" width="15" height="7" rx="3.5" fill="#4fd6cb" />
          <line x1="32" y1="4" x2="32" y2="14" stroke="#ffd166" strokeWidth="3" />
          <circle cx="32" cy="5" r="4" fill="#ff7a59" />
          <rect x="8" y="14" width="48" height="40" rx="14" fill="#5ef2e6" />
          <rect x="15" y="22" width="34" height="20" rx="9" fill="#04182b" />
          <circle cx="25" cy="32" r="4.5" fill="#5ef2e6" />
          <circle cx="39" cy="32" r="4.5" fill="#5ef2e6" />
          <path d="M26 47 q6 4 12 0" stroke="#04182b" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

// The brass-rimmed window. `sinking` is the loading screen: bubbles rush past as the station rises into view.
export function Porthole({ label, sinking = false, className = '' }: { label: string; sinking?: boolean; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`porthole ${sinking ? 'sinking' : ''} ${className}`}>
      <div className="porthole-glass">
        <Scene sinking={sinking} />
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="porthole-bolt" style={{ transform: `rotate(${i * 30}deg)` }} aria-hidden />
      ))}
    </div>
  )
}

// Shown while the 3D station downloads: the porthole sinks, Pip reads out the five rules, and the keys are ready to learn.
export function Loading({ label }: { label: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % CORE.length), 2800)
    return () => clearInterval(t)
  }, [])
  const lab = CORE[i]
  return (
    <main className="hull fixed inset-0 grid place-items-center overflow-y-auto p-5">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <Porthole sinking label={label} className="w-[min(58vmin,24rem)]" />
        {/* Pip talking from the window: the tail points up at it */}
        <p key={lab.id} className="pip-bubble pw-fade -mt-2 text-lg">
          <span className="absolute -top-[11px] left-[30%] size-4 rotate-45 border-t-3 border-l-3 border-glow bg-sand" aria-hidden />
          <b>{UI.lab} {lab.num}:</b> {lab.rule}
        </p>
        <p role="status" className="text-3xl font-black sm:text-4xl">{UI.loadingStation}</p>
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-sand/85">
          {HALL.keys.map((k) => (
            <li key={k.does} className="flex items-center gap-1.5">
              {k.keys.map((key) => <kbd key={key} className="keycap">{key}</kbd>)}
              <span className="ml-1">{k.does}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

// The small version inside a lab while its game loads.
export function LoadingLab() {
  return (
    <p className="card flex items-center gap-3 text-lg" role="status">
      <span className="mini-porthole" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {UI.loadingLab}
    </p>
  )
}
