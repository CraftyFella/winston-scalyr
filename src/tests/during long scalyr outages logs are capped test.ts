import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

test('to avoid memory leaks queue size is capped', async () => {
  const fakeScalyrApi = createFakeScalyrApi(200)

  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    level: 'verbose',
    maxBatchSize: 10,
    maxQueueSize: 100,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'secret',
    autoStart: false
  })

  log.clear()
  log.add(scalyrTransport)

  for (let index = 1; index <= 200; index++) {
    log.info(`A test Info message ${index}`)
  }

  await scalyrTransport.flush()
  await scalyrTransport.flush()

  expect(fakeScalyrApi.received.length).toBe(10)
  expect(fakeScalyrApi.received[0].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[1].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[2].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[3].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[4].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[5].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[6].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[7].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[8].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[9].body.events.length).toBe(10)
  expect(fakeScalyrApi.received[9].body.events[9].attrs.message).toBe("A test Info message 100")
  
  scalyrTransport.close()
})
