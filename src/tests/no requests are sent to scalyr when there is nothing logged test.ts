import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'
jest.useFakeTimers()

test('no requests are sent to scalyr when there is nothing logged', async () => {
  const fakeScalyrApi = createFakeScalyrApi(200, () => {})

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

  jest.advanceTimersByTime(1001)

  expect(fakeScalyrApi.received.length).toBe(0)
  scalyrTransport.close()
})
