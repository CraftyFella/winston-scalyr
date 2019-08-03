import nock from 'nock';

export interface ScalyrRequest {
  uri: string
  body?: any
}

export const createFakeScalyrApi = (statusCode: number) => {
  const received: ScalyrRequest[] = []

  const address = 'https://api.github.com';
  const scope = nock(address)
  .matchHeader('content-type', 'application/json')
  .post('/addEvents')
  .reply(statusCode, (uri, requestBody) => {
    received.push({
      uri: uri,
      body: requestBody
    })
    return {}
  })

  return { server: scope, address: address, received: received }
}