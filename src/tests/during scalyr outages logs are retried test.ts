import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

test('during scalyr outages logs are retried', async () => {
  
  const fakeScalyrApi = createFakeScalyrApi(500)

  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    level: 'verbose',
    maxBatchSize: 5,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'secret',
    autoStart: false
  })

  log.clear()
  log.add(scalyrTransport)

  log.info('A test Info message 1')

  await scalyrTransport.flush()

  expect(fakeScalyrApi.received.length).toBe(1)

  await scalyrTransport.flush()

  expect(fakeScalyrApi.received.length).toBe(2)

  scalyrTransport.close()
  
})
