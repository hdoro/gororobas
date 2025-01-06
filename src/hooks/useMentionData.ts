import {
  type GetMentionByIdResult,
  getMentionsById,
} from '@/actions/getMentionsData'
import { useQuery } from '@tanstack/react-query'
import { Effect, Ref, Schedule } from 'effect'

interface QueueItem {
  id: string
  resolve: (result: GetMentionByIdResult) => void
}

const queueRef = Effect.runSync(Ref.make<QueueItem[]>([]))

const processQueue = Effect.gen(function* (_) {
  const items = yield* _(Ref.get(queueRef))

  if (items.length === 0) return

  yield* _(Ref.set(queueRef, []))

  const results = yield* _(getMentionsById(items.map((item) => item.id)))

  // Resolve @tanstack/react-query promises
  items.forEach((item, index) => {
    item.resolve(results[index])
  })
})

// @TODO find a better way to run the schedule. Ideally it'd only run when there's something in the queue
// Given we have an early return, it's probably not a big performance deal
const scheduledProcess = processQueue.pipe(
  Effect.schedule(Schedule.spaced('200 millis')),
)
Effect.runFork(scheduledProcess)

export function useMentionData(id: string) {
  return useQuery({
    queryKey: ['useMentionData', id],
    queryFn: () =>
      new Promise((resolve: (result: GetMentionByIdResult) => void) => {
        Effect.runSync(
          Ref.update(queueRef, (queue) => [...queue, { id, resolve }]),
        )
      }),
    // initialData: fallbackData,
    staleTime: 60 * 60 * 1000, // Consider data fresh for 1 hour
  })
}
