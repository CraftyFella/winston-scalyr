import Transport from 'winston-transport'
import needle = require('needle')
import { ScalyrTransportOptions } from '../build'
import {
  nowInNanoSeconds,
  levelToSeverity,
  ScalyrEvent,
  AddEventRequest
} from './domain'

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
    if (options.autoStart || true) {
      this.initTimer()
    }
  }

  log(info: any, next: () => void) {
    console.log('got a message', info)
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
        ts: nowInNanoSeconds().toString(),
        sev: levelToSeverity(item.level),
        attrs: item
      }
    }

    const uri = `${that.options.endpoint || 'https://www.scalyr.com'}/addEvents`

    const flush = async () => {
      console.log('About to flush and queue is', that.queue, uri)
      const events = that.queue.splice(0, that.maxBatchSize).map(toScalyrEvent)
      if (events.length) {
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

        await needle('post', uri, body, {
          content_type: 'application/json'
        })
      }

      if (that.running) {
        setTimeout(flush, that.options.frequencyMs)
      }
    }

    setTimeout(flush, that.options.frequencyMs)
  }
}

export default ScalyrTransport
