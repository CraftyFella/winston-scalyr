import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

test('close flushes all the logs', async () => {
  const fakeScalyrApi = createFakeScalyrApi(200)
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

  log.info('A test Info message', { messageKey: 'message Value' })
  log.info('A test Info message', { messageKey: 'message Value' })
  log.info('A test Info message', { messageKey: 'message Value' })
  log.info('A test Info message', { messageKey: 'message Value' })
  log.info('A test Info message', { messageKey: 'message Value' })
  log.info('A test Info message', { messageKey: 'message Value' })
  log.info('A test Info message', { messageKey: 'message Value' })

  expect(fakeScalyrApi.received.length).toBe(0)

  await scalyrTransport.close()

  expect(fakeScalyrApi.received.length).toBe(2)
  expect(fakeScalyrApi.received[0].body.events.length).toBe(5)
  expect(fakeScalyrApi.received[1].body.events.length).toBe(2)

})
