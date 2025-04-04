import { postContentToBluesky } from '@/bluesky-bot/bluesky-bot'
import * as Bluesky from '@/services/bluesky'
import * as Gel from '@/services/gel'
import * as ResendService from '@/services/resend'
import { runServerEffect } from '@/services/runtime'
import { FetchHttpClient } from '@effect/platform'
import { NodeContext } from '@effect/platform-node'
import { Effect, Layer, LogLevel, Logger } from 'effect'
import type { NextRequest } from 'next/server'

const AllServices = Layer.mergeAll(
  Bluesky.fromEnv,
  NodeContext.layer,
  FetchHttpClient.layer,
  Gel.layer,
  ResendService.fromEnv,
)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const result = await runServerEffect(
    Effect.scoped(postContentToBluesky).pipe(
      Effect.provide(AllServices),
      Logger.withMinimumLogLevel(LogLevel.Debug),
    ),
  )
  return Response.json(result)
}
