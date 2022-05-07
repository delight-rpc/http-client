import { buildServer } from './http-client.mock'
import { createClient } from '@src/http-client'
import { startService, stopService, getAddress } from './utils'
import '@blackglory/jest-matchers'

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

    const result = client.echo('hello')
    const proResult = await result

    // @ts-ignore
    expect(result).toBePromise()
    expect(proResult).toStrictEqual('hello')
  })
})
