import Winston from 'winston'
import { ScalyrTransport, delay } from '../../scalyrTransport'
import { createFakeScalyrApi } from '../helpers'

test('end to end test using timer', async (done) => {
  const fakeScalyrApi = createFakeScalyrApi(200, undefined, done)
  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    level: 'verbose',
    maxBatchSize: 2,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'secret',
    frequencyMs: 1000,
    autoStart: true
  })

  log.clear()
  log.add(scalyrTransport)

  log.info('A test Info message', { messageKey: 'message Value' })

  expect(fakeScalyrApi.received.length).toBe(0)

  await delay(3000)

  expect(fakeScalyrApi.received.length).toBe(1)

  log.info('Another test Info message', { messageKey: 'message Value' })

  await delay(3000)

  expect(fakeScalyrApi.received.length).toBe(2)

  scalyrTransport.close()

  
})
