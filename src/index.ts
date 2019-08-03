import Transport from 'winston-transport'
import needle = require('needle')
import {
  nowInNanoSeconds,
  levelToSeverity,
  ScalyrEvent,
  AddEventRequest,
  ScalyrTransportOptions
} from './domain'
import http from 'http'

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
    const toScalyrEvent = (item: any): ScalyrEvent => {
      return {
        ts: nowInNanoSeconds().toString(),
        sev: levelToSeverity(item.level),
        attrs: item
      }
    }

    const that = this

    const isSuccessful = (response: http.IncomingMessage) => {
      const statusCode = response.statusCode || 0
      return statusCode >= 200 && statusCode <= 299
    }

    const sendBatch = async (logs: any[]) => {
      const events = logs.map(toScalyrEvent)
      const uri = 'https://www.scalyr.com/addEvents'
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
      const response = await needle('post', uri, body, {
        content_type: 'application/json'
      })

      return isSuccessful(response)
    }

    const reQueue = (logs: any[]) => {
      logs.forEach(log => that.queue.unshift(log))
    }

    const flush = async () => {
      do {
        const logs = that.queue.splice(0, that.maxBatchSize)
        if (logs.length) {
          const success = await sendBatch(logs)
          if (!success) {
            reQueue(logs)
            break
          }
        }
      } while (that.queue.length >= that.maxBatchSize)

      if (that.running) {
        setTimeout(flush, that.options.frequencyMs)
        if (that.options.onScheduled) that.options.onScheduled()
      }
    }

    setTimeout(flush, that.options.frequencyMs)
  }
}

export default ScalyrTransport
