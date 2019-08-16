import { createEventsSender } from "../../eventsSender";
import { createFakeScalyrApi } from "../helpers";
import each from "jest-each";


var fakeScalyrApi: any

beforeAll(() => {
  fakeScalyrApi = createFakeScalyrApi(200)  
})

each([['debug', 2], ['info', 3], ['warn', 4], ['error', 5]])
  .test('level %s is mapped from sev %d', async (level: string, sev: number) => {
  
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

  const result = await sender([{ 'level': level }]);
  expect(result).toBe(true)

  expect(fakeScalyrApi.received.length).toBe(1)
  expect(fakeScalyrApi.received[0].body).toMatchObject({
    events: [
      {
        sev: sev
      }
    ]
  })
  fakeScalyrApi.received.pop()
})
