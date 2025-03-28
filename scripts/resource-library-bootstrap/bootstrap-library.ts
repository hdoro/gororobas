import { FetchHttpClient } from '@effect/platform'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect, Layer } from 'effect'
import * as Level from '../resource-sourcing/level'
import { importTagsAndResources } from './import-resources'

const AllServices = Layer.mergeAll(
  Level.layer('scripts/resource-library-bootstrap/images-cache'),
  FetchHttpClient.layer,
  NodeContext.layer,
)

NodeRuntime.runMain(
  Effect.scoped(importTagsAndResources).pipe(Effect.provide(AllServices)),
)
