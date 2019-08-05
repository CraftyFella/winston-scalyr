import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

jest.useFakeTimers()

test('logs are mapped to scalyr request', async (done) => {
  const fakeScalyrApi = createFakeScalyrApi(200, undefined, done)

  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    level: 'verbose',
    maxBatchSize: 2,
    frequencyMs: 1000,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'secret'
  })

  log.clear()
  log.add(scalyrTransport)

  log.info('A test Info message', { messageKey: 'message Value' })

  expect(fakeScalyrApi.received.length).toBe(0)

  jest.advanceTimersByTime(1001)

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
