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

## Usage
```ts
// api.d.ts
interface IAPI {
  echo(message: string): string
}

// client.ts
const client = createClient<IAPI>({
  server: 'http://localhost:8080'
, keepalive: true
})

await client.echo('hello')
```

## API
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
```

### createClient
```ts
function createClient<IAPI extends object>(
  clientOptions: IClientOptions
, options?: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  }
): DelightRPC.ClientProxy<IAPI>
```

### createBatchClient
```ts
export function createBatchClient(
  clientOptions: IClientOptions
, options?: {
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  }
): DelightRPC.BatchClient
