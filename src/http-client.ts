import * as DelightRPC from 'delight-rpc'
import { fetch } from 'extra-fetch'
import { post } from 'extra-request'
import { ok, toJSON } from 'extra-response'
import { json, url } from 'extra-request/lib/es2015/transformers'
import { JsonRpcResponse, Json  } from '@blackglory/types'

interface IClientOptions {
  server: string
}

export function createClient<IAPI extends object>(options: IClientOptions) {
  const client = DelightRPC.createClient<IAPI>(async jsonRpc => {
    const req = post(
      url(options.server)
    , json(jsonRpc)
    )

    return await fetch(req)
      .then(ok)
      .then(toJSON) as JsonRpcResponse<Json>
  })

  return client
}
