import { RequestHandler } from 'restify'
import { createNamespace } from 'cls-hooked'
import uuidv1 from 'uuid/v1'

const ns = createNamespace('tracing-example')

const tracingMiddleware: RequestHandler = (req, res, next) => {
  ns.bindEmitter(req)
  ns.bindEmitter(res)

  const requestid = uuidv1()
  const correlationId = req.headers['correlationid'] || requestid
  const causationid = req.headers['causationid'] || requestid

  ns.run(() => {
    ns.set('tracingContext', {
      correlationId: correlationId,
      requestId: requestid,
      causationId: causationid
    })
    next()
  })
}

const tracingContext = () => ns.get('tracingContext')

export { tracingMiddleware, tracingContext }
