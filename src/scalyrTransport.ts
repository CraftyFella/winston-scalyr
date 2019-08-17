import Transport from 'winston-transport'
import { ScalyrTransportOptions, ScalyrEventsSender } from './domain'
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
  sendBatch: ScalyrEventsSender

  constructor(options: ScalyrTransportOptions) {
    super()
    this.level = options.level || 'verbose'
    this.maxBatchSize = options.maxBatchSize || 100
    this.frequencyMs = options.frequencyMs || 5000
    this.options = options
    if (options.autoStart || true) {
      this.startPolling()
    }
    this.sendBatch = createEventsSender(this.options)

  }

  log(info: any, next: () => void) {
    this.queue.push(info)
    next()
  }

  async close() {
    this.running = false
    await this.flush(0)
  }

  private startPolling() {
    const flushLoop = async () => {
      while (this.running) {
        await delay(this.frequencyMs)
        await this.flush()
      }
    }

    flushLoop() // Should exit as it's async
  }

  private reQueue(logs: any[]) {
    logs.forEach(log => this.queue.unshift(log))
  }

  async flush(minSize? :number) {
    const min = minSize === undefined ? this.maxBatchSize : minSize
    do {
      const logs = this.queue.splice(0, this.maxBatchSize)
      if (logs.length) {
        const success = await this.sendBatch(logs)
        if (!success) {
          this.reQueue(logs)
          break
        }
      }  
    } while (this.queue.length > min)
  }
}

export default ScalyrTransport
