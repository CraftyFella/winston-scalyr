import Transport from 'winston-transport'
import {
  ScalyrTransportOptions
} from './domain'
import { createEventsSender } from './eventsSender';

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

    const sendBatch = createEventsSender(this.options)

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
