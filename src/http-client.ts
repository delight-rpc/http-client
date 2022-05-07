import * as DelightRPC from 'delight-rpc'
import { fetch } from 'extra-fetch'
import { post } from 'extra-request'
import { ok, toJSON } from 'extra-response'
import { json, url, signal, keepalive, basicAuth } from 'extra-request/transformers'
import { Json } from 'justypes'
import { timeoutSignal } from 'extra-abort'

export { HTTPError } from 'extra-response'

export interface IClientOptions {
  server: string
  timeout?: number
  keepalive?: boolean
  basicAuth?: {
    username: string
    password: string
  }
}

export function createClient<IAPI extends object>(
  options: IClientOptions
, parameterValidators?: DelightRPC.ParameterValidators<IAPI>
, expectedVersion?: `${number}.${number}.${number}`
): DelightRPC.ClientProxy<IAPI> {
  const client = DelightRPC.createClient<IAPI, Json>(
    createSend(options)
  , parameterValidators
  , expectedVersion
  )

  return client
}

export function createBatchClient(
  options: IClientOptions
, expectedVersion?: `${number}.${number}.${number}`
): DelightRPC.BatchClient {
  const client = new DelightRPC.BatchClient<Json>(
    createSend(options)
  , expectedVersion
  )

  return client
}

function createSend<T>(options: IClientOptions) {
  /**
   * @throws {AbortError}
   * @throws {HTTPError}
   */
  return async function (request: DelightRPC.IRequest<Json> | DelightRPC.IBatchRequest<Json>) {
    const auth = options.basicAuth

    const req = post(
      url(options.server)
    , auth && basicAuth(auth.username, auth.password)
    , json(request)
    , options.timeout && signal(timeoutSignal(options.timeout))
    , keepalive(options.keepalive)
    )

    return await fetch(req)
      .then(ok)
      .then(toJSON) as T
  }
}
