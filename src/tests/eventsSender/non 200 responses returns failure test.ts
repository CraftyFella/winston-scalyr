import { createEventsSender } from '../../eventsSender'
import { createFakeScalyrApi } from '../helpers';

jest.useRealTimers()

test('non 200 responses returns failure', async () => {

  createFakeScalyrApi(500)

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