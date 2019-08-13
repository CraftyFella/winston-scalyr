import { createEventsSender } from '../../eventsSender'
import { delay } from '../helpers';

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

  await delay(50)
  expect(result).toBe(false)
})