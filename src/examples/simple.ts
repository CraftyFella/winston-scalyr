import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { hostname } from 'os'

var running = true

export const log = Winston.createLogger()
const scalyrTransport = new ScalyrTransport({
  frequencyMs: 1000,
  logfile: 'winston-scalyr-example',
  serverHost: hostname(),
  session: new Date().getTime.toString(),
  sessionInfo: { version: '0.0.0-beta.0' },
  token: process.env.SCALYR_TOKEN || 'Unknown'
})
log.clear()
log.add(scalyrTransport)

function delay(delay: number) {
  return new Promise(r => {
    setTimeout(r, delay)
  })
}

const main = async () => {
  log.info('Hello first message')
  log.info('Complex Object', { numberField: 1, stringField: 'hello' })
  await delay(1200)
  log.error('Hello first error')
  await delay(200)
  log.error('Hello second error')
  await delay(900)
  log.info('Hello second message')
  await delay(1100)
  log.debug('a debug message')
  log.verbose('a verbose message')
  await delay(1100)
  running = false
}

const spin = () => {
  if (running) {
    console.log('.')
    setTimeout(spin, 100)
  } else {
    scalyrTransport.close()
    console.log('x')
  }
}

main()
spin()
