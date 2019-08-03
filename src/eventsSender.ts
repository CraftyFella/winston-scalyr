import needle from 'needle'
import http from 'http'
import { Severity, LogToScalyrEvent, LogsToAddEventsRequest, AddEventsRequest, ScalyrEventsSender, ScalyrTransportOptions } from './domain';

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

export const toScalyrEvent: LogToScalyrEvent = item => {
  return {
    ts: nowInNanoSeconds().toString(),
    sev: levelToSeverity(item.level),
    attrs: item
  }
}

export const toScalyrAddEventsRequest: LogsToAddEventsRequest = (options, logs) => {
  const events = logs.map(toScalyrEvent)
  const request: AddEventsRequest = {
    token: options.token,
    session: options.session,
    sessionInfo: {
      ...options.sessionInfo,
      logfile: options.logfile,
      serverHost: options.serverHost
    },
    events: events
  }
  return request
}

export const createEventsSender = (options: ScalyrTransportOptions) : ScalyrEventsSender => {
  return async (logs) => {
    const isSuccessful = (response: http.IncomingMessage) => {
      const statusCode = response.statusCode || 0
      return statusCode >= 200 && statusCode <= 299
    }
  
    const request = toScalyrAddEventsRequest(options, logs)
  
    const uri = 'https://www.scalyr.com/addEvents'
  
    const response = await needle('post', uri, request, {
      content_type: 'application/json'
    })
  
    return isSuccessful(response)
  }
}