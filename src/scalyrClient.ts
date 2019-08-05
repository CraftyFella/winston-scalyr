import needle from 'needle'
import http from 'http'
import { AddEventsRequest } from './domain'

export const addEvents = async (
  request: AddEventsRequest,
  timeout?: number
): Promise<boolean> => {
  const isSuccessful = (response: http.IncomingMessage) => {
    const statusCode = response.statusCode || 0
    return statusCode >= 200 && statusCode <= 299
  }

  const uri = 'https://www.scalyr.com/addEvents'

  try {
    const response = await needle('post', uri, request, {
      content_type: 'application/json',
      timeout: timeout
    })
    return isSuccessful(response)
  } catch (err) {
    console.error(err)
    return false
  }
}
