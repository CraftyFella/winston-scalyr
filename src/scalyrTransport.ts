import Transport from 'winston-transport'
import { ScalyrTransportOptions, BatchingScalyrEventsSender } from './domain'
import { createBatchingEventsSender } from './eventsSender'

export const delay = (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
export class ScalyrTransport extends Transport {
  queue: Array<any> = []
  frequencyMs: number
  running: boolean = true
  batchingSender: BatchingScalyrEventsSender

  constructor(options: ScalyrTransportOptions) {
    super()
    this.level = options.level || 'verbose'
    this.frequencyMs = options.frequencyMs || 5000
    this.batchingSender = createBatchingEventsSender(options)
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
    await this.batchingSender(this.queue, minSize)
  }
}

export default ScalyrTransport
