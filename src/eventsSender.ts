import { Severity, LogToScalyrEvent, LogsToAddEventsRequest, AddEventsRequest, ScalyrEventsSender, ScalyrTransportOptions, BatchingScalyrEventsSender } from './domain';
import { addEvents } from './scalyrClient';

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

const nowInNanoSeconds = () => new Date().getTime() * 1000000

const toScalyrEvent: LogToScalyrEvent = item => {
  return {
    ts: nowInNanoSeconds().toString(),
    sev: levelToSeverity(item.level),
    attrs: item
  }
}

const toScalyrAddEventsRequest: LogsToAddEventsRequest = (options, logs) => {
  const events = logs.map(toScalyrEvent)
  const request: AddEventsRequest = {
    token: options.token,
    session: options.session,
    sessionInfo: {
      ...options.sessionInfo,
      logfile: options.logfile,
      serverHost: options.serverHost,
      parser: options.parser
    },
    events: events
  }
  return request
}

export const createEventsSender = (options: ScalyrTransportOptions) : ScalyrEventsSender => {
  return async (logs) => {
    const request = toScalyrAddEventsRequest(options, logs)
    return await addEvents(request, options.timeout)
  }
}

export const createBatchingEventsSender = (options: ScalyrTransportOptions): BatchingScalyrEventsSender => {

  const sendBatch = createEventsSender(options)

  return async (logs, minSize) => {

    const reQueue = (batch: any[]) => {
      batch.forEach(log => logs.unshift(log))
    }

    const maxBatchSize = options.maxBatchSize || 100
    const min = minSize === undefined ? maxBatchSize: minSize
    
    do {
      const batch = logs.splice(0, maxBatchSize)
      if (batch.length) {
        const success = await sendBatch(batch)
        if (!success) {
          reQueue(batch)
          break
        }
      }  
    } while (logs.length > min)
  }

}
