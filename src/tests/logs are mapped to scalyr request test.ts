import Winston from 'winston'
import { ScalyrTransport } from '../index'
import { createFakeScalyrApi } from './helpers'

// TODO:

// If there are too many events > Max, then keep going until events is less than Max
// If Scalyr is down, retry
// Errors are written to console.error

jest.useFakeTimers()

test('logs are mapped to scalyr request', async (done) => {
  const fakeScalyrApi = createFakeScalyrApi(200, done)

  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    endpoint: fakeScalyrApi.address,
    level: 'verbose',
    maxBatchSize: 2,
    frequencyMs: 1000,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'ShhhitsASecret'
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
    token: 'ShhhitsASecret'
  })
  expect(parseInt(fakeScalyrApi.received[0].body.events[0].ts)).toBeGreaterThan(
    1564674320616000000
  )

  scalyrTransport.close()
})
