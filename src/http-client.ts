import * as DelightRPC from 'delight-rpc'
import { IRequest, IBatchRequest, IResponse, IAbort, IBatchResponse } from '@delight-rpc/protocol'
import { fetch } from 'extra-fetch'
import { post } from 'extra-request'
import { ok, toJSON } from 'extra-response'
import { json, url, signal as withSignal, keepalive, basicAuth } from 'extra-request/transformers'
import { JSONValue } from 'justypes'
import { AbortController, raceAbortSignals, timeoutSignal } from 'extra-abort'
import { SyncDestructor } from 'extra-defer'
import { pass } from '@blackglory/prelude'

export interface IClientOptions {
  server: string
  timeout?: number
  keepalive?: boolean
  basicAuth?: {
    username: string
    password: string
  }
}

export function createClient<IAPI extends object>(
  clientOptions: IClientOptions
, { parameterValidators, expectedVersion, channel }: {
    parameterValidators?: DelightRPC.ParameterValidators<IAPI>
    expectedVersion?: string
    channel?: string
  } = {}
): [client: DelightRPC.ClientProxy<IAPI>, close: () => void] {
  const destructor = new SyncDestructor()

  const controller = new AbortController()
  destructor.defer(abortAllPendings)

  const client = DelightRPC.createClient<IAPI, JSONValue>(
    async function send(request, signal) {
      const destructor = new SyncDestructor()

      try {
        const mergedSignal = raceAbortSignals([
          signal
        , controller.signal
        ])
        mergedSignal.addEventListener('abort', sendAbort)
        destructor.defer(() => mergedSignal.removeEventListener('abort', sendAbort))

        return await sendMessage(request, clientOptions, mergedSignal)
      } finally {
        destructor.execute()
      }

      async function sendAbort(): Promise<void> {
        const abort = DelightRPC.createAbort(request.id, channel)
        await sendMessage(abort, clientOptions).catch(pass)
      }
    }
  , {
      parameterValidators
    , expectedVersion
    , channel
    }
  )

  return [client, close]

  function close(): void {
    destructor.execute()
  }

  function abortAllPendings(): void {
    controller.abort()
  }
}

export function createBatchClient(
  clientOptions: IClientOptions
, { expectedVersion, channel }: {
    expectedVersion?: string
    channel?: string
  } = {}
): [client: DelightRPC.BatchClient, close: () => void] {
  const destructor = new SyncDestructor()

  const controller = new AbortController()
  destructor.defer(abortAllPendings)

  const client = new DelightRPC.BatchClient<JSONValue>(
    async function send(request) {
      const destructor = new SyncDestructor()

      try {
        const mergedSignal = raceAbortSignals([
          controller.signal
        ])
        mergedSignal.addEventListener('abort', sendAbort)
        destructor.defer(() => mergedSignal.removeEventListener('abort', sendAbort))

        return await sendMessage(request, clientOptions, mergedSignal)
      } finally {
        destructor.execute()
      }

      async function sendAbort(): Promise<void> {
        const abort = DelightRPC.createAbort(request.id, channel)
        await sendMessage(abort, clientOptions).catch(pass)
      }
    }
  , {
      expectedVersion
    , channel
    }
  )

  return [client, close]

  function close(): void {
    destructor.execute()
  }

  function abortAllPendings(): void {
    controller.abort()
  }
}

async function sendMessage(
  message: IRequest<JSONValue>
, options: IClientOptions
, signal?: AbortSignal
): Promise<IResponse<JSONValue>>
async function sendMessage(
  message: IAbort
, options: IClientOptions
, signal?: AbortSignal
): Promise<void>
async function sendMessage(
  message: IBatchRequest<JSONValue> | IAbort
, options: IClientOptions
, signal?: AbortSignal
): Promise<IBatchResponse<JSONValue>>
async function sendMessage(
  message: IRequest<JSONValue> | IAbort | IBatchRequest<JSONValue>
, options: IClientOptions
, signal?: AbortSignal
): Promise<IResponse<JSONValue> | IBatchResponse<JSONValue> | void> {
  const auth = options.basicAuth

  const mergedSignal = raceAbortSignals([
    signal
  , options.timeout && timeoutSignal(options.timeout)
  ])

  const req = post(
    url(options.server)
  , auth && basicAuth(auth.username, auth.password)
  , json(message as JSONValue)
  , withSignal(mergedSignal)
  , options.keepalive && keepalive()
  )

  const res = await fetch(req)
  await ok(res)

  if (DelightRPC.isAbort(message)) {
    await consume(res)
  } else {
    return await toJSON<IResponse<JSONValue>>(res)
  }
}

async function consume(res: Response): Promise<void> {
  if (res.bodyUsed) return
  if (!res.body) return

  for await (const _ of res.body) {
    // force consumption of body
  }
}
