# @delight-rpc/http-client

## Install

```sh
npm install --save @delight-rpc/http-client
# or
yarn add @delight-rpc/http-client
```

## API

```ts
interface IClientOptions {
  host: string
  port: number
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
function createClient<IAPI extends object>(options: IClientOptions): DelightRPC.RequestProxy<IAPI>
```
