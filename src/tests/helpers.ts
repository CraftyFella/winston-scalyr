import nock from 'nock';

export interface ScalyrRequest {
  uri: string
  body?: any
}

export const createFakeScalyrApi = (statusCode: number, onRecieved: () => void) => {
  const received: ScalyrRequest[] = []

  const address = 'https://www.scalyr.com';
  const scope = nock(address)
  .persist()
  .matchHeader('content-type', 'application/json')
  .post('/addEvents')
  .reply(statusCode, (uri, requestBody) => {
    received.push({
      uri: uri,
      body: requestBody
    })
    onRecieved()
    return {}
  })

  return { server: scope, address: address, received: received }
}