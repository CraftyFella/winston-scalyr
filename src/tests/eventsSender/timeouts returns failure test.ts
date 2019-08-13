import { createEventsSender } from '../../eventsSender'

jest.useRealTimers()

test('exception occurs returns failure', async () => {

  const sender = createEventsSender({
    logfile: '',
    serverHost: 'host',
    session: '',
    token: 'Shhh',
    timeout: 1
  })

  const result = await sender([{ 'An': 'Event' }]);
  expect(result).toBe(false)
})