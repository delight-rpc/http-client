import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { createResponse } from 'delight-rpc'

const API = {
  echo(message: string): string {
    return message
  }
}

export const server = setupServer(
  rest.post('/', async (req, res, ctx) => {
    const result = await createResponse(API, req.body as any)

    return res(
      ctx.status(200)
    , ctx.json(result)
    )
  })
)
