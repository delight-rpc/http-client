import { buildServer } from './http-client.mock.js'
import { createClient } from '@src/http-client.js'
import { startService, stopService, getAddress } from './utils.js'
import { createBatchClient } from '@src/http-client.js'
import { createBatchProxy } from 'delight-rpc'
import { getErrorPromise } from 'return-style'

beforeAll(() => startService(buildServer))
afterAll(stopService)

interface IAPI {
  echo(message: string): string
  error(message: string): never
}

describe('createClient', () => {
  test('echo', async () => {
    const client = createClient<IAPI>({ server: getAddress() })

    const result = await client.echo('hello')

    expect(result).toStrictEqual('hello')
  })

  test('echo (batch)', async () => {
    const client = createBatchClient({ server: getAddress() })
    const proxy = createBatchProxy<IAPI>()

    const result = await client.parallel(proxy.echo('hello'))

    expect(result.length).toBe(1)
    expect(result[0].unwrap()).toBe('hello')
  })

  test('error', async () => {
    const client = createClient<IAPI>({ server: getAddress() })

    const err = await getErrorPromise(client.error('hello'))

    expect(err).toBeInstanceOf(Error)
    expect(err!.message).toMatch('hello')
  })

  test('error (batch)', async () => {
    const client = createBatchClient({ server: getAddress() })
    const proxy = createBatchProxy<IAPI>()

    const result = await client.parallel(proxy.error('hello'))

    expect(result.length).toBe(1)
    const err = result[0].unwrapErr()
    expect(err).toBeInstanceOf(Error)
    expect(err!.message).toMatch('hello')
  })
})
