type SessionInfo = { [key: string]: any }

type OnScheduled = () => void
export interface ScalyrTransportOptions {
  readonly level?: string
  readonly maxBatchSize?: number
  readonly frequencyMs: number
  readonly session: string
  readonly serverHost: string
  readonly logfile: string
  readonly sessionInfo: SessionInfo
  readonly token: string
  readonly onScheduled?: OnScheduled
}

export type Severity = 1 | 2 | 3 | 4 | 5 | 6

export const levelToSeverity = (level: string): Severity => {
  const options = new Map()
  options.set('verbose', 1)
  options.set('debug', 2)
  options.set('info', 3)
  options.set('warning', 4)
  options.set('warn', 4)
  options.set('error', 5)
  options.set('crit', 6)
  options.set('emerg', 6)
  options.set('alert', 6)

  return options.get(level) || 3
}

export const nowInNanoSeconds = () => new Date().getTime() * 1000000

export interface ScalyrEvent {
  readonly ts: string
  readonly sev: Severity
  readonly attrs: any
}

export interface AddEventRequest {
  readonly token: string
  readonly session: string
  readonly sessionInfo: SessionInfo
  readonly events: Array<ScalyrEvent>
}