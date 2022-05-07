import * as DelightRPC from 'delight-rpc'
import { IRequest, IBatchRequest, IResponse, IBatchResponse } from '@delight-rpc/protocol'
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

export class HTTPClientAdapter implements DelightRPC.IClientAdapter<Json> {
  private listeners = new Set<(response: IResponse<Json> | IBatchResponse<Json>) => void>()

  constructor(private options: IClientOptions) {}

  /**
   * @throws {AbortError}
   * @throws {HTTPError}
   */
  async send(request: IRequest<Json> | IBatchRequest<Json>): Promise<void> {
    const auth = this.options.basicAuth

    const req = post(
      url(this.options.server)
    , auth && basicAuth(auth.username, auth.password)
    , json(request)
    , this.options.timeout && signal(timeoutSignal(this.options.timeout))
    , keepalive(this.options.keepalive)
    )

    const response = await fetch(req)
      .then(ok)
      .then(toJSON) as IResponse<Json> | IBatchResponse<Json>
    this.listeners.forEach(listener => listener(response))
  }

  listen(listener: (response: IResponse<Json> | IBatchResponse<Json>) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.clear()
  }
}
