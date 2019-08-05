import nock from 'nock';

export interface ScalyrRequest {
  uri: string
  body?: any
}

export const createFakeScalyrApi = (statusCode: number, timeout?: number, onRecieved?: () => void) => {
  const received: ScalyrRequest[] = []

  const address = 'https://www.scalyr.com';
  const scope = nock(address)
  .persist()
  .matchHeader('content-type', 'application/json')
  .post('/addEvents')
  .socketDelay(timeout || 2000)
  .reply(statusCode, (uri, requestBody) => {
    received.push({
      uri: uri,
      body: requestBody
    })
    if (onRecieved) onRecieved()
    return {}
  })

  return { server: scope, address: address, received: received }
}

export const delay = (ms: number) => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}