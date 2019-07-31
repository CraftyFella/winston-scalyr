import Transport from 'winston-transport'
import needle = require('needle')

type SessionInfo = { [key: string]: any }

export interface ScalyrTransportOptions {
  readonly level?: string
  readonly maxBatchSize?: number
  readonly frequencyMs: number
  readonly session: string
  readonly serverHost: string
  readonly logfile: string
  readonly sessionInfo: SessionInfo
  readonly token: string
}

type Severity = 1 | 2 | 3 | 4 | 5 | 6

const levelToSeverity = (level: string): Severity => {
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

const nowInNannoSeconds = () => new Date().getTime() * 1000000

interface ScalyrEvent {
  readonly ts: string
  readonly sev: Severity
  readonly attrs: any
}

interface AddEventRequest {
  readonly token: string
  readonly session: string
  readonly sessionInfo: SessionInfo
  readonly events: Array<ScalyrEvent>
}

export class ScalyrTransport extends Transport {
  options: ScalyrTransportOptions
  queue: Array<any> = []
  maxBatchSize: number
  running: boolean = true

  constructor(options: ScalyrTransportOptions) {
    super()
    this.level = options.level || 'verbose'
    this.maxBatchSize = options.maxBatchSize || 100
    this.options = options
    this.initTimer()
  }

  log(info: any, next: () => void) {
    this.queue.push(info)
    next()
  }

  close() {
    this.running = false
  }

  initTimer() {
    const that = this

    const toScalyrEvent = (item: any): ScalyrEvent => {
      return {
        ts: nowInNannoSeconds().toString(),
        sev: levelToSeverity(item.level),
        attrs: item
      }
    }

    const flush = () => {
      const events = that.queue.splice(0, that.maxBatchSize).map(toScalyrEvent)

      const body: AddEventRequest = {
        token: that.options.token,
        session: that.options.session,
        sessionInfo: {
          ...that.options.sessionInfo,
          logfile: that.options.logfile,
          serverHost: that.options.serverHost
        },
        events: events
      }
      needle('post', 'https://www.scalyr.com/addEvents', body, {
        content_type: 'application/json'
      })
      if (that.running) {
        setTimeout(flush, that.options.frequencyMs)
      }
    }

    setTimeout(flush, that.options.frequencyMs)
  }
}
