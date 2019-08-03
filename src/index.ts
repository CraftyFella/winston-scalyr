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

    const sendBatch = async (events: ScalyrEvent[]) => {
      const uri = `${that.options.endpoint ||
        'https://www.scalyr.com'}/addEvents`
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

    const flush = async () => {
      do {
        
        const events = that.queue
          .splice(0, that.maxBatchSize)
          .map(toScalyrEvent)

        if (events.length) {
          //console.log('About to send some events to scalyr', events)
          await sendBatch(events)
        }
        //console.log('More to go?', that.queue.length, that.maxBatchSize, that.queue.length >= that.maxBatchSize)
      } while (that.queue.length >= that.maxBatchSize)

      if (that.running) {
        setTimeout(flush, that.options.frequencyMs)
      }
    }

    setTimeout(flush, that.options.frequencyMs)
  }
}

export default ScalyrTransport
