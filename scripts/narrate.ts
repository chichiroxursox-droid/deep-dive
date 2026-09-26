// One-time build step: pre-generates "Read to me" MP3s with ElevenLabs. The app never calls ElevenLabs.
// Run: node --env-file=.env.local scripts/narrate.ts
// src/narration.json is the ledger of what was already paid for: a lab listed there is never generated again,
// even if its MP3 is deleted, so the 2,000-character cap counts real spend. To re-record a lab on purpose, remove
// its entry from the ledger by hand and accept that it spends again.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { LESSONS, narration } from '../src/content.ts'

const CAP = 2000
const dir = new URL('../public/audio/', import.meta.url)
const manifestUrl = new URL('../src/narration.json', import.meta.url)
const manifest: Record<string, string> = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, 'utf8')) : {}

const todo = LESSONS.filter((l) => !(l.id in manifest))
const spent = Object.values(manifest).reduce((n, t) => n + t.length, 0)
const needed = todo.reduce((n, l) => n + narration(l).length, 0)
if (spent + needed > CAP) throw new Error(`Would use ${spent + needed} characters, over the ${CAP} cap`)

mkdirSync(dir, { recursive: true })
for (const l of todo) {
  const text = narration(l)
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
  })
  if (!res.ok) throw new Error(`${l.id}: ${res.status} ${await res.text()}`)
  writeFileSync(new URL(`${l.id}.mp3`, dir), Buffer.from(await res.arrayBuffer()))
  manifest[l.id] = text
  writeFileSync(manifestUrl, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`${l.id}: ${text.length} chars`)
}
console.log(`total narrated: ${Object.values(manifest).reduce((n, t) => n + t.length, 0)} / ${CAP} characters`)
