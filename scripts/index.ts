import { NodeContext } from '@effect/platform-node'
import { Effect, Layer, pipe } from 'effect'
import type { ResourceCustomizer } from './resource-sourcing/add-resource-to-inbox'
import { processChannelVideos } from './resource-sourcing/process-channel-videos'
import { processPodcastEpisodes } from './resource-sourcing/process-podcast-episodes'
import { SCRIPT_PATHS } from './script.utils'
import * as Level from './services/level'
import * as Youtube from './services/youtube'

const AllServices = Layer.mergeAll(
  Level.layer(SCRIPT_PATHS.sourcing_db),
  Youtube.fromEnv,
  NodeContext.layer,
)

async function main(
  props: { customizer?: ResourceCustomizer } & (
    | {
        channelURL: string
      }
    | { rssFeedURL: string }
  ),
) {
  await Effect.runPromise(
    Effect.gen(function* () {
      if ('channelURL' in props) {
        yield* processChannelVideos(props.channelURL, props.customizer)
      } else {
        yield* processPodcastEpisodes(props.rssFeedURL, props.customizer)
      }
    }).pipe(Effect.provide(AllServices)),
  )
}

// main({
//   channelURL: 'https://www.youtube.com/@cepeas2219',
// })
main({
  rssFeedURL: 'https://feeds.simplecast.com/SdKZe7SN',
  customizer: (resource) => ({
    ...resource,
    credit_line: 'Prato Cheio (O Joio e o Trigo)',
    description: resource.description.split(
      'O Joio e o Prato Cheio são mantidos',
    )[0],
  }),
})
