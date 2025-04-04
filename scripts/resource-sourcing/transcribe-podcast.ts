import * as Whisper from '@/services/whisper'
import { FileSystem, Path } from '@effect/platform'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Data, Effect, Layer } from 'effect'
import { glob } from 'glob'

class FileSystemError extends Data.TaggedError('FileSystemError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

// Process a single audio file
const processAudioFile = (audioPath: string) => {
  return Effect.gen(function* (_) {
    const path = yield* Path.Path
    const fs = yield* FileSystem.FileSystem
    const whisper = yield* Whisper.Whisper

    const { transcriptionPath } = yield* whisper.transcribe(audioPath)

    // Move processed file to processed directory
    const processedDir = path.join(path.dirname(audioPath), '..', 'processed')

    yield* fs.makeDirectory(processedDir, { recursive: true })

    const destPath = {
      audio: path.join(processedDir, path.basename(audioPath)),
      transcription: path.join(processedDir, path.basename(transcriptionPath)),
    }
    yield* fs.rename(audioPath, destPath.audio)
    yield* fs.rename(transcriptionPath, destPath.transcription)

    yield* Effect.logInfo(`Moved ${audioPath} to ${destPath.audio}`)
  }).pipe(
    Effect.catchAll((error) => {
      if (error instanceof Error) {
        return Effect.logError(
          `❌ Error processing ${audioPath}: ${error.message}`,
        )
      }
      return Effect.logError(
        `❌ Error processing ${audioPath}: ${error.message}`,
      )
    }),
    Effect.withLogSpan('processAudioFile'),
  )
}

// Main function to process all audio files
const program = Effect.gen(function* (_) {
  const path = yield* Path.Path
  const INPUT_DIR = path.join(__dirname, 'podcasts', 'inbox')
  yield* Effect.logInfo('Starting podcast transcription process')

  // Find all audio files in the podcasts/inbox directory
  const audioFiles = yield* Effect.tryPromise({
    try: () => glob(`${INPUT_DIR}/**/*.{mp3,wav,m4a,ogg}`),
    catch: (error) =>
      new FileSystemError({
        message: `Failed to find audio files: ${String(error)}`,
        cause: error,
      }),
  })

  yield* Effect.logInfo(`Found ${audioFiles.length} audio files to process.`)

  yield* Effect.all(
    audioFiles.map((file) => processAudioFile(file)),
    { concurrency: 2 },
  )

  yield* Effect.logInfo('All audio files processed!')
}).pipe(Effect.withLogSpan('transcribe_podcasts'))

const Services = Layer.merge(Whisper.layer(), NodeContext.layer)

NodeRuntime.runMain(Effect.scoped(program).pipe(Effect.provide(Services)))
