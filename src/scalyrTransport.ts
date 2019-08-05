import Transport from 'winston-transport'
import { ScalyrTransportOptions } from './domain'
import { createEventsSender } from './eventsSender'

export class ScalyrTransport extends Transport {
  options: ScalyrTransportOptions
  queue: Array<any> = []
  maxBatchSize: number
  frequencyMs: number
  running: boolean = true

  constructor(options: ScalyrTransportOptions) {
    super()
    this.level = options.level || 'verbose'
    this.maxBatchSize = options.maxBatchSize || 100
    this.frequencyMs = options.frequencyMs || 5000
    this.options = options
    if (options.autoStart || true) {
      this.startPolling()
    }
  }

  log(info: any, next: () => void) {
    this.queue.push(info)
    next()
  }

  close() {
    this.running = false
  }

  startPolling() {
    const that = this

    const flushAndReschedule = async () => {
      await this.flush.apply(that)
      if (that.running) {
        setTimeout(flushAndReschedule, that.frequencyMs)
        if (that.options.onScheduled) {
          that.options.onScheduled()
        }
      }
    }

    setTimeout(flushAndReschedule, that.frequencyMs)
  }

  async flush() {
    const sendBatch = createEventsSender(this.options)

    const reQueue = (logs: any[]) => {
      logs.forEach(log => this.queue.unshift(log))
    }

    do {
      const logs = this.queue.splice(0, this.maxBatchSize)
      if (logs.length) {
        const success = await sendBatch(logs)
        if (!success) {
          reQueue(logs)
          break
        }
      }
    } while (this.queue.length >= this.maxBatchSize)
  }
}

export default ScalyrTransport
