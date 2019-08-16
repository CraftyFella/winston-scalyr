import Transport from 'winston-transport'
import { ScalyrTransportOptions } from './domain'
import { createEventsSender } from './eventsSender'

export const delay = (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
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

  async close() {
    this.running = false
    await this.flush()
  }

  startPolling() {
    const flushLoop = async () => {
      while (this.running) {
        await delay(this.frequencyMs)
        await this.flush()
      }
    }

    flushLoop() // Should exit as it's async
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
    } while ((!this.running && this.queue.length) || (this.running && this.queue.length >= this.maxBatchSize))
  }
}

export default ScalyrTransport
