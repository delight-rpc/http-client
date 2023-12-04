import { fastify } from 'fastify'
import { createResponse } from 'delight-rpc'

const API = {
  echo(message: string): string {
    return message
  }
, error(message: string): never {
    throw new Error(message)
  }
}

export function buildServer() {
  const server = fastify({
    forceCloseConnections: true
  })

  server.post('/', async (req, reply) => {
    const result = await createResponse(API, req.body as any)

    return reply.status(200).send(result)
  })

  return server
}
