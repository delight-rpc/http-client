import { buildServer } from './http-client.mock'
import { createClient } from '@src/http-client'
import { startService, stopService, getAddress } from './utils'
import { createBatchClient } from '@src/http-client.js'
import { createBatchProxy } from 'delight-rpc'

beforeAll(() => startService(buildServer))
afterAll(stopService)

interface IAPI {
  echo(message: string): string
}

describe('createClient', () => {
  test('echo', async () => {
    const client = createClient<IAPI>({
      server: getAddress()
    })

    const result = await client.echo('hello')

    expect(result).toStrictEqual('hello')
  })

  test('echo (batch)', async () => {
    const client = createBatchClient({
      server: getAddress()
    })
    const proxy = createBatchProxy<IAPI>()

    const result = await client.parallel(proxy.echo('hello'))

    expect(result.length).toBe(1)
    expect(result[0].unwrap()).toBe('hello')
  })
})
