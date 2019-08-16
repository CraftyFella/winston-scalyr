import { createLogger, format } from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { hostname } from 'os'
import { tracingContext } from './tracing'

const { json, combine } = format

const enrichWithTracing = format(info => {
  return { ...info, ...tracingContext() }
})

export const logger = createLogger({
  format: combine(enrichWithTracing(), json()),
  
  transports: [
    new ScalyrTransport({
      frequencyMs: 10000,
      maxBatchSize: 5,
      logfile: 'winston-scalyr-tracing-example',
      serverHost: hostname(),
      session: new Date().getTime.toString(),
      sessionInfo: { version: '0.0.0-beta.0' },
      token: process.env.SCALYR_TOKEN || 'Unknown'
    })
  ]
})
