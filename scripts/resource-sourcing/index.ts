import { NodeContext } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import * as Level from './level'
import { processChannelVideos } from './process-channel-videos'
import * as Youtube from './youtube'

const AllServices = Layer.mergeAll(
  Level.layer('./scripts/resource-sourcing/db'),
  Youtube.fromEnv,
  NodeContext.layer,
)

async function main() {
  await Effect.runPromise(
    processChannelVideos('https://www.youtube.com/@cepeas2219').pipe(
      Effect.provide(AllServices),
    ),
  )
}

main()
