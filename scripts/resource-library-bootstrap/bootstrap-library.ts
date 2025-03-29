import { FetchHttpClient } from '@effect/platform'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import * as Level from '../resource-sourcing/level'
import { SCRIPT_PATHS } from '../script.utils'
import { importTagsAndResources } from './import-resources'

const AllServices = Layer.mergeAll(
  Level.layer(SCRIPT_PATHS.images_downloading_cache),
  FetchHttpClient.layer,
  NodeContext.layer,
)

NodeRuntime.runMain(
  Effect.scoped(importTagsAndResources).pipe(Effect.provide(AllServices)),
)
