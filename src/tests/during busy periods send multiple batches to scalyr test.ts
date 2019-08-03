import Winston from 'winston'
import { ScalyrTransport } from '../index'
import { createFakeScalyrApi } from './helpers'

jest.useFakeTimers()

test('during busy periods send multiple batches to scalyr', async (done) => {
  var count : number = 0
  const fakeScalyrApi = createFakeScalyrApi(200, () => {
    console.log('On Recveived', count)
    count++
    if (count == 2) {
      // Sent up 2 batches of 5
      expect(fakeScalyrApi.received.length).toBe(2) 
      expect(fakeScalyrApi.received[0].body.events.length).toBe(5)
      expect(fakeScalyrApi.received[1].body.events.length).toBe(5)
      
      scalyrTransport.close()
      done()
    }
  })

  const log = Winston.createLogger()

  const scalyrTransport = new ScalyrTransport({
    endpoint: fakeScalyrApi.address,
    level: 'verbose',
    maxBatchSize: 5,
    frequencyMs: 1000,
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    sessionInfo: { key: 'value', 'key 2': 2 },
    token: 'ShhhitsASecret'
  })

  log.clear()
  log.add(scalyrTransport)

  log.info('A test Info message 1')
  log.info('A test Info message 2')
  log.info('A test Info message 3')
  log.info('A test Info message 4')
  log.info('A test Info message 5')
  log.info('A test Info message 6')
  log.info('A test Info message 7')
  log.info('A test Info message 8')
  log.info('A test Info message 9')
  log.info('A test Info message 10')
  log.info('A test Info message 11')

  jest.advanceTimersByTime(1001)

  
})
