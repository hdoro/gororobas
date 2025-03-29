import {
  Command,
  FileSystem,
  Path,
  type CommandExecutor,
} from '@effect/platform'
import type { PlatformError } from '@effect/platform/Error'
import {
  Context,
  Data,
  Effect,
  Layer,
  pipe,
  Stream,
  String,
  type Scope,
} from 'effect'

type WhisperOptions = {
  model: string
  language: string
}

class TranscriptionError extends Data.TaggedError('TranscriptionError')<{
  readonly message: string
  readonly cause?: unknown
}> {}

interface WhisperServiceImpl {
  readonly transcribe: (audioPath: string) => Effect.Effect<
    {
      result: string
      transcriptionPath: string
    },
    TranscriptionError | PlatformError,
    | CommandExecutor.CommandExecutor
    | Path.Path
    | FileSystem.FileSystem
    | Scope.Scope
  >
}

export class Whisper extends Context.Tag('WhisperService')<
  Whisper,
  WhisperServiceImpl
>() {}

// Helper function to collect stream output as a string
const runString = <E, R>(
  stream: Stream.Stream<Uint8Array, E, R>,
): Effect.Effect<string, E, R> =>
  stream.pipe(Stream.decodeText(), Stream.runFold(String.empty, String.concat))

const make = (options: WhisperOptions) =>
  Effect.gen(function* () {
    return Whisper.of({
      transcribe: (audioPath: string) =>
        Effect.gen(function* (_) {
          const path = yield* Path.Path
          const fs = yield* FileSystem.FileSystem
          const baseFilename = path.basename(audioPath, path.extname(audioPath))

          const WHISPER_DIR = path.join(__dirname, 'whisper.cpp')
          const command = Command.make(
            path.join(WHISPER_DIR, 'build/bin/whisper-cli'),
            '--model',
            '$MODEL',
            '--language',
            '$LANGUAGE',
            '--output-vtt',
            '--file',
            '$INPUT_FILE',
            '--output-file',
            '$OUTPUT_FILE',
          ).pipe(
            Command.env({
              MODEL: path.join(WHISPER_DIR, 'models', `${options.model}.bin`),
              LANGUAGE: options.language,
              INPUT_FILE: audioPath,
              OUTPUT_FILE: path.join(path.dirname(audioPath), baseFilename),
            }),
            Command.runInShell(true),
          )

          yield* Effect.logInfo(`🎙️ Transcribing: ${audioPath}`)

          const [stdout, stderr] = yield* pipe(
            // Start running the command and return a handle to the running process
            Command.start(command),
            Effect.flatMap((process) =>
              Effect.all(
                [
                  // The standard output stream of the process
                  runString(process.stdout),
                  // The standard error stream of the process
                  runString(process.stderr),
                ],
                { concurrency: 'unbounded' },
              ),
            ),
          )

          yield* Effect.logDebug({ stdout, stderr })
          if (!stdout) {
            yield* Effect.logError(
              `Failed to transcribe audio file: ${baseFilename}`,
              stderr,
            )
            return yield* Effect.fail(
              new TranscriptionError({
                message: `Failed to transcribe audio file: ${baseFilename}`,
                cause: stderr,
              }),
            )
          }

          const whisperOutputPath = path.join(
            path.dirname(audioPath),
            `${baseFilename}.vtt`,
          )

          const transcriptionCreated = yield* fs.exists(whisperOutputPath)
          if (!transcriptionCreated) {
            return yield* Effect.fail(
              new TranscriptionError({
                message: `Failed to create transcription file: ${baseFilename}. ${whisperOutputPath}`,
              }),
            )
          }

          return {
            result: stdout,
            transcriptionPath: whisperOutputPath,
          }
        }),
    })
  })

export const layer = (options?: Partial<WhisperOptions>) =>
  Layer.scoped(
    Whisper,
    make({
      model: 'ggml-large-v3-turbo',
      language: 'pt',
      ...(options || {}),
    }),
  )
