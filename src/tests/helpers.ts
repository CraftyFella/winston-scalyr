import http from 'http'

export interface ScalyrRequest {
  uri: string
  body?: any
  headers: http.IncomingHttpHeaders
}

type OnRequestReceived = (request: ScalyrRequest) => void

export const createFakeScalyrApi = async (
  statusCode: number,
  onRequestReceived: OnRequestReceived
) => {
  const writeResponse = (response: http.ServerResponse, statuscode: number) => {
    response.statusCode = statuscode
    response.end()
  }

  const received: ScalyrRequest[] = []
  const server = http.createServer((req, res) => {
    const url = req.url || ''

    var message: ScalyrRequest = {
      uri: url,
      headers: req.headers
    }

    received.push(message)

    req.on('data', data => {
      message.body = JSON.parse(data.toString())
      onRequestReceived(message)
    })

    if (url.endsWith('/addEvents')) {
      writeResponse(res, statusCode)
    } else {
      writeResponse(res, 404)
    }
  })

  const port = Math.floor(Math.random() * 1000) + 8080
  await new Promise(resolve => server.listen(port, resolve))
  const address = `http://127.0.0.1:${port}`
  return { server: server, address: address, received: received }
}
