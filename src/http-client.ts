import * as DelightRPC from 'delight-rpc'
import { IRequest, IBatchRequest } from '@delight-rpc/protocol'
import { fetch } from 'extra-fetch'
import { post } from 'extra-request'
import { ok, toJSON } from 'extra-response'
import { json, url, signal, keepalive, basicAuth } from 'extra-request/transformers'
import { JSONValue } from 'justypes'
import { timeoutSignal } from 'extra-abort'

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
    expectedVersion?: string
    channel?: string
  } = {}
): DelightRPC.ClientProxy<IAPI> {
  const client = DelightRPC.createClient<IAPI, JSONValue>(
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
    expectedVersion?: string
    channel?: string
  } = {}
): DelightRPC.BatchClient {
  const client = new DelightRPC.BatchClient<JSONValue>(
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
  return async function (request: IRequest<JSONValue> | IBatchRequest<JSONValue>) {
    const auth = options.basicAuth

    const req = post(
      url(options.server)
    , auth && basicAuth(auth.username, auth.password)
    , json(request)
    , options.timeout && signal(timeoutSignal(options.timeout))
    , options.keepalive && keepalive()
    )

    return await fetch(req)
      .then(ok)
      .then(toJSON) as T
  }
}
