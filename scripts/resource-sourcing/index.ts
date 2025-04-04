import * as Level from '@/services/level'
import * as Youtube from '@/services/youtube'
import { NodeContext } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import { SCRIPT_PATHS } from '../script.utils'
import type { ResourceCustomizer } from './add-resource-to-inbox'
import { processChannelVideos } from './process-channel-videos'
import { processPodcastEpisodes } from './process-podcast-episodes'

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
