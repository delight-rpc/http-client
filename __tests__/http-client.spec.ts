import { buildServer } from './http-client.mock'
import { HTTPClientAdapter } from '@src/http-client'
import { createClient } from 'delight-rpc'
import { startService, stopService, getAddress } from './utils'

beforeAll(() => startService(buildServer))
afterAll(stopService)

interface IAPI {
  echo(message: string): string
}

describe('createClient', () => {
  test('echo', async () => {
    const adapter = new HTTPClientAdapter({ server: getAddress() })
    const [client] = createClient<IAPI>(adapter)

    const result = await client.echo('hello')

    expect(result).toStrictEqual('hello')
  })
})
