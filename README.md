# @delight-rpc/http-client
The HTTP client library of [delight-rpc],
it needs to be used with the server implementation [@delight-rpc/http-server].

[delight-rpc]: https://www.npmjs.com/package/delight-rpc
[@delight-rpc/http-server]: https://www.npmjs.com/package/@delight-rpc/http-server


## Install
```sh
npm install --save @delight-rpc/http-client
# or
yarn add @delight-rpc/http-client
```

## API
### HTTPClientAdapter
```ts
interface IClientOptions {
  server: string
  timeout?: number
  keepalive?: boolean
  basicAuth?: {
    username: string
    password: string
  }
}

class HTTPClientAdapter implements DelightRPC.IClientAdapter<Json> {
  constructor(private options: IClientOptions)

  /**
   * @throws {AbortError}
   * @throws {HTTPError}
   */
  async send(request: IRequest<Json> | IBatchRequest<Json>): Promise<void>
  listen(listener: (response: IResponse<Json> | IBatchResponse<Json>) => void): () => void
}
```
