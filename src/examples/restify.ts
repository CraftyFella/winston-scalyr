import { createServer } from 'restify'
import { tracingMiddleware } from './tracing'
import { logger } from './logger'

const server = createServer()
server.use(tracingMiddleware)

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const simulateSlowDatabaseCall = async () => {
  logger.info('Before db Call')
  await delay(3000)
  logger.info('After db Call')
}

server.get('/', async (_req, res, next) => {
  res.send('hello world from restify')

  logger.info('complex before', {
    'string-key': 'string-value',
    'number-key': 1
  })
  logger.info('request handler info before')

  await simulateSlowDatabaseCall()

  logger.info('request handler info after')

  next()
})

server.listen(3001, () => {
  console.log('%s listening at %s', server.name, server.url)
})
