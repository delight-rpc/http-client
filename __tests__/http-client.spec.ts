import { buildServer } from './http-client.mock'
import { createClient } from '@src/http-client'
import { startService, stopService, getAddress } from './utils'

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
})
