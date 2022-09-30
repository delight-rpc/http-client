import * as DelightRPC from 'delight-rpc'
import { IRequest, IBatchRequest } from '@delight-rpc/protocol'
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
  clientOptions: IClientOptions
, { parameterValidators, expectedVersion, channel }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): DelightRPC.ClientProxy<IAPI> {
  const client = DelightRPC.createClient<IAPI, Json>(
    createSend(clientOptions)
  , {
      parameterValidators
    , expectedVersion
    , channel
    }
  )

  return client
}

export function createBatchClient(
  clientOptions: IClientOptions
, { expectedVersion, channel }: {
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): DelightRPC.BatchClient {
  const client = new DelightRPC.BatchClient<Json>(
    createSend(clientOptions)
  , {
      expectedVersion
    , channel
    }
  )

  return client
}

function createSend<T>(options: IClientOptions) {
  /**
   * @throws {AbortError}
   * @throws {HTTPError}
   */
  return async function (request: IRequest<Json> | IBatchRequest<Json>) {
    const auth = options.basicAuth

    const req = post(
      url(options.server)
    , auth && basicAuth(auth.username, auth.password)
    , json(request)
    , options.timeout && signal(timeoutSignal(options.timeout))
    , keepalive(options.keepalive ?? false)
    )

    return await fetch(req)
      .then(ok)
      .then(toJSON) as T
  }
}
