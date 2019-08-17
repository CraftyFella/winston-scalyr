import Transport from 'winston-transport'
import { ScalyrTransportOptions, BatchingScalyrEventsSender } from './domain'
import { createBatchingEventsSender } from './eventsSender'

export const delay = (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
export class ScalyrTransport extends Transport {
  options: ScalyrTransportOptions
  queue: Array<any> = []
  maxBatchSize: number
  frequencyMs: number
  running: boolean = true
  sendLogs: BatchingScalyrEventsSender

  constructor(options: ScalyrTransportOptions) {
    super()
    this.level = options.level || 'verbose'
    this.maxBatchSize = options.maxBatchSize || 100
    this.frequencyMs = options.frequencyMs || 5000
    this.options = options
    if (options.autoStart || true) {
      this.startPolling()
    }
    this.sendLogs = createBatchingEventsSender(this.options)

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

  async flush(minSize? :number) {
    await this.sendLogs(this.queue, minSize)
  }
}

export default ScalyrTransport
