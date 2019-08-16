import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

test('logs are mapped to scalyr request', async () => {
  const fakeScalyrApi = createFakeScalyrApi(200)
  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    level: 'verbose',
    maxBatchSize: 2,
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

  expect(fakeScalyrApi.received.length).toBe(0)

  await scalyrTransport.flush()

  expect(fakeScalyrApi.received.length).toBe(1)
  expect(fakeScalyrApi.received[0].body).toMatchObject({
    events: [
      {
        attrs: {
          level: 'info',
          message: 'A test Info message',
          messageKey: 'message Value'
        },
        sev: 3
      }
    ],
    session: 'aSessionValue',
    sessionInfo: {
      key: 'value',
      'key 2': 2,
      logfile: 'test',
      serverHost: 'hostname'
    },
    token: 'secret'
  })
  expect(parseInt(fakeScalyrApi.received[0].body.events[0].ts)).toBeGreaterThan(
    1564674320616000000
  )

  scalyrTransport.close()
})
