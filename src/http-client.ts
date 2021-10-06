import * as DelightRPC from 'delight-rpc'
import { fetch } from 'extra-fetch'
import { post } from 'extra-request'
import { ok, toJSON } from 'extra-response'
import { json, url, signal, keepalive, basicAuth } from 'extra-request/transformers/index.js'
import { JsonRpcResponse, Json } from 'justypes'
import { timeoutSignal } from 'extra-promise'

export { HTTPError } from 'extra-response'
export { AbortError } from 'extra-fetch'

export interface IClientOptions {
  server: string
  timeout?: number
  keepalive?: boolean
  basicAuth?: {
    username: string
    password: string
  }
}

export function createClient<IAPI extends object>(options: IClientOptions): DelightRPC.RequestProxy<IAPI> {
  const client = DelightRPC.createClient<IAPI>(
    /**
     * @throws {AbortError}
     * @throws {HTTPError}
     */
    async function jsonRpc() {
      const auth = options.basicAuth

      const req = post(
        url(options.server)
      , auth && basicAuth(auth.username, auth.password)
      , json(jsonRpc)
      , options.timeout && signal(timeoutSignal(options.timeout))
      , keepalive(options.keepalive)
      )

      return await fetch(req)
        .then(ok)
        .then(toJSON) as JsonRpcResponse<Json>
    }
  )

  return client
}
