import Winston from 'winston'
import { ScalyrTransport } from '../scalyrTransport'
import { createFakeScalyrApi } from './helpers'

jest.useFakeTimers()

test('during scalyr outages logs are retried', async (done) => {
  var count : number = 0
  const fakeScalyrApi = createFakeScalyrApi(500, () => {
    count++
    console.log('On Recevied', count)
    if (count == 2) {
      expect(fakeScalyrApi.received.length).toBe(2) 
      scalyrTransport.close()
      done()
    }
  })

  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    level: 'verbose',
    maxBatchSize: 5,
    frequencyMs: 1000,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'secret',
    onScheduled: () =>  {
      jest.advanceTimersByTime(1001)
    }
  })

  log.clear()
  log.add(scalyrTransport)

  log.info('A test Info message 1')

  jest.advanceTimersByTime(1001)
  
})
