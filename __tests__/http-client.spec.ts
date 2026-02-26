import { beforeAll, afterAll, describe, test, expect } from 'vitest'
import { buildServer } from './http-client.mock.js'
import { createClient } from '@src/http-client.js'
import { startService, stopService, getAddress } from './utils.js'
import { createBatchClient } from '@src/http-client.js'
import { createBatchProxy } from 'delight-rpc'
import { getErrorPromise } from 'return-style'
import { IAPI } from './contract.js'
import { AbortController, AbortError } from 'extra-abort'

beforeAll(() => startService(buildServer))
afterAll(stopService)

describe('createClient', () => {
  test('result', async () => {
    const [client, close] = createClient<IAPI>({ server: getAddress() })

    const result = await client.echo('foo')
    close()

    expect(result).toStrictEqual('foo')
  })

  test('result (batch)', async () => {
    const [client, close] = createBatchClient({ server: getAddress() })
    const proxy = createBatchProxy<IAPI>()

    const result = await client.parallel(proxy.echo('foo'))
    close()

    expect(result.length).toBe(1)
    expect(result[0].unwrap()).toBe('foo')
  })

  test('error', async () => {
    const [client, close] = createClient<IAPI>({ server: getAddress() })

    const err = await getErrorPromise(client.error('foo'))
    close()

    expect(err).toBeInstanceOf(Error)
    expect(err?.message).toMatch('foo')
  })

  test('error (batch)', async () => {
    const [client, close] = createBatchClient({ server: getAddress() })
    const proxy = createBatchProxy<IAPI>()

    const result = await client.parallel(proxy.error('foo'))
    close()

    expect(result.length).toBe(1)
    const err = result[0].unwrapErr()
    expect(err).toBeInstanceOf(Error)
    expect(err?.message).toMatch('foo')
  })

  test('abort', async () => {
    const [client, close] = createClient<IAPI>({ server: getAddress() })
    const controller = new AbortController()

    const promise = getErrorPromise(client.loop(controller.signal))
    controller.abort()
    const err = await promise
    close()

    expect(err).toBeInstanceOf(AbortError)
  })
})
