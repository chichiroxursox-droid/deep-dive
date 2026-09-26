import { TOOLBOX as T } from '../../content.ts'

export type ToolId = (typeof T.tools)[number]['id']
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k]))

export const rightTool = (jobId: string) => T.jobs.find((j) => j.id === jobId)!.tool

// What Pip says when it uses `tool` for a job. The calculator really multiplies.
export function answer(jobId: string, tool: ToolId): { text: string; right: boolean } {
  const job: { a?: number; b?: number; tool: string; answers: Record<string, string> } = T.jobs.find((j) => j.id === jobId)!
  const product = job.a && job.b ? (job.a * job.b).toLocaleString('en-US') : ''
  return { text: fill(job.answers[tool], { product }), right: job.tool === tool }
}

// Agent mode: a step is judged right when you said yes to a safe step or no to an unsafe one.
export const judge = (decisions: (boolean | undefined)[]) => T.steps.map((s, i) => decisions[i] === s.ok)
export const snackTotal = () => T.divers * T.price
