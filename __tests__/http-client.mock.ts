import { fastify } from 'fastify'
import * as DelightRPC from 'delight-rpc'
import { IAPI } from './contract.js'
import { assert } from '@blackglory/prelude'
import { delay } from 'extra-promise'

const api: DelightRPC.ImplementationOf<IAPI> = {
  echo(message: string): string {
    return message
  }
, error(message: string): never {
    throw new Error(message)
  }
, async loop(signal?: AbortSignal): Promise<never> {
    assert(signal)

    while (!signal.aborted) {
      await delay(100)
    }

    throw signal.reason
  }
}

export function buildServer() {
  const server = fastify({
    forceCloseConnections: true
  })

  server.post('/', async (req, reply) => {
    const message = req.body

    if (
      DelightRPC.isRequest(message) ||
      DelightRPC.isBatchRequest(message)
    ) {
      const res = await DelightRPC.createResponse(api, message)

      return reply
        .status(200)
        .send(res)
    } else if (DelightRPC.isAbort(message)) {
      return reply
        .status(201)
        .send()
    } else {
      return reply
        .status(400)
        .send('Invalid request body')
    }
  })

  return server
}
