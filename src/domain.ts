type SessionInfo = { [key: string]: any }

export interface ScalyrTransportOptions {
  readonly session: string
  readonly serverHost: string
  readonly logfile: string
  readonly token: string
  readonly timeout?: number
  readonly level?: string
  readonly maxBatchSize?: number
  readonly maxQueueSize?: number
  readonly frequencyMs?: number
  readonly sessionInfo?: SessionInfo
  readonly autoStart?: boolean
}

export type Severity = 1 | 2 | 3 | 4 | 5 | 6

export interface ScalyrEvent {
  readonly ts: string
  readonly sev: Severity
  readonly attrs: any
}

export interface AddEventsRequest {
  readonly token: string
  readonly session: string
  readonly sessionInfo: SessionInfo
  readonly events: Array<ScalyrEvent>
}

export type LogToScalyrEvent = (log: any) => ScalyrEvent
export type LogsToAddEventsRequest = (
  options: ScalyrTransportOptions,
  logs: any[]
) => AddEventsRequest
export type ScalyrEventsSender = (logs: any[]) => Promise<boolean>
export type BatchingScalyrEventsSender = (
  logs: any[],
  min?: number
) => Promise<void>
