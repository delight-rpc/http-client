import { server } from '@test/http-client.mock'
import { createClient } from '@src/http-client'
import '@blackglory/jest-matchers'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

interface API {
  echo(message: string): string
}

describe('createClient', () => {
  test('echo', async () => {
    const client = createClient<API>({ server: 'http://localhost' })

    const result = client.echo('hello')
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toStrictEqual('hello')
  })
})
