import * as DelightRPC from 'delight-rpc'
import { fetch } from 'extra-fetch'
import { post } from 'extra-request'
import { ok, toJSON } from 'extra-response'
import { json, host, port, signal, keepalive } from 'extra-request/lib/es2015/transformers'
import { JsonRpcResponse } from '@blackglory/types'
import { Json } from 'justypes'
import { timeoutSignal } from 'extra-promise'

export interface IClientOptions {
  host: string
  port: number
  timeout?: number
  keepalive?: boolean
}

export function createClient<IAPI extends object>(options: IClientOptions): DelightRPC.RequestProxy<IAPI> {
  const client = DelightRPC.createClient<IAPI>(async jsonRpc => {
    const req = post(
      host(options.host)
    , port(options.port)
    , json(jsonRpc)
    , options.timeout && signal(timeoutSignal(options.timeout))
    , keepalive(options.keepalive)
    )

    return await fetch(req)
      .then(ok)
      .then(toJSON) as JsonRpcResponse<Json>
  })

  return client
}
