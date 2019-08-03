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
export type LogsToAddEventsRequest = (options : ScalyrTransportOptions, logs: any[]) => AddEventsRequest
export type ScalyrEventsSender = (logs: any[]) => Promise<boolean>