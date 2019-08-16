import { createFakeScalyrApi } from '../helpers'
import { createEventsSender } from '../../eventsSender';

jest.useFakeTimers()

test('logs are mapped to scalyr request', async () => {
  const fakeScalyrApi = createFakeScalyrApi(200)

  const sender = createEventsSender({
    logfile: 'test',
    serverHost: 'hostname',
    session: 'aSessionValue',
    token: 'Shhh',
    timeout: 1,
    sessionInfo: {
      key: 'value',
      'key 2': 2
    },
  })

  const result = await sender([{ 'An': 'Event', 'level': 'info' }]);
  expect(result).toBe(true)

  expect(fakeScalyrApi.received.length).toBe(1)
  expect(fakeScalyrApi.received[0].body).toMatchObject({
    events: [
      {
        attrs: {
          An: 'Event'
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
    token: 'Shhh'
  })
  expect(parseInt(fakeScalyrApi.received[0].body.events[0].ts)).toBeGreaterThan(
    1564674320616000000
  )
})