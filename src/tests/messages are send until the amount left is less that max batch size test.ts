import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

test('messages are send until the amount left is less that max batch size', async () => {
  
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
  log.info('A test Info message 1')
  log.info('A test Info message 1')
  log.info('A test Info message 1')
  log.info('A test Info message 1')
  log.info('A test Info message 1')

  await scalyrTransport.flush()

  expect(fakeScalyrApi.received.length).toBe(1)
  expect(fakeScalyrApi.received[0].body.events.length).toBe(5)
  
  scalyrTransport.close()
  
})
