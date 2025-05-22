import { Fragment, type JSX, type PropsWithChildren } from 'react'

type Fragments = {
  [tag: string]: (props: PropsWithChildren) => JSX.Element
}

type I18nReplacerProps = {
  message: string
  fragments?: Fragments
}

const DEFAULT_FRAGMENTS: Fragments = {
  br: (props) => (
    <>
      <br />
      {props.children}
    </>
  ),
}

type Part =
  | { type: 'text'; content: string }
  | { type: 'fragment'; tag: string; content: string }

/**
 * Takes an i18n message with `<italics>multiple</italics> <strong>content in fragments</strong>` and renders them accordingly.
 *
 * ⚠️ Does not support nesting one fragment inside another.
 * 🌟 Already includes a default fragment for line breaks (`<br></br>` in the message)
 * 
 * @example
 * <ReplaceI18nFragment
      message={m.my_message()} // ex: Here a <link>link in the middle</link> of the sentence
      fragments={{
        link: ({ children }) => (
          <Link
            href={paths.editVegetable(vegetable.handle)}
            className="font-semibold underline"
          >
            <Edit2Icon className="inline-block h-4 w-4" /> {children}
          </Link>
        ),
      }}
    />
 **/
export default function ReplaceI18nFragments(props: I18nReplacerProps) {
  return (
    <>
      {extractPartsFromMessage(props).map((part, i) =>
        part.type === 'text' ? (
          // biome-ignore lint: For this, it's fine to use the index as part of the key
          <Fragment key={i + part.content}>{part.content}</Fragment>
        ) : (
          // biome-ignore lint: For this, it's fine to use the index as part of the key
          <Fragment key={i + part.content}>
            {(props.fragments || DEFAULT_FRAGMENTS)[part.tag]({
              children: part.content,
            })}
          </Fragment>
        ),
      )}
    </>
  )
}

function extractPartsFromMessage({
  fragments = DEFAULT_FRAGMENTS,
  message,
}: I18nReplacerProps): Part[] {
  // Build a regex that matches any of the fragment tags
  const tags = Object.keys(fragments)
  if (tags.length === 0) return [{ type: 'text', content: message }]

  // Example: /<(italics|strong)>(.*?)<\/\1>/g
  const tagPattern = tags
    .map((tag) => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const regex = new RegExp(`<(${tagPattern})>([\\s\\S]*?)<\\/\\1>`, 'g')

  const result: Array<
    | { type: 'text'; content: string }
    | { type: 'fragment'; tag: string; content: string }
  > = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  // biome-ignore lint: to be honest, I got this online and I'm happy with it 😬
  while ((match = regex.exec(message)) !== null) {
    // Text before the fragment
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: message.slice(lastIndex, match.index),
      })
    }
    // The fragment itself
    result.push({
      type: 'fragment',
      tag: match[1],
      content: match[2],
    })
    lastIndex = regex.lastIndex
  }

  // Any remaining text after the last fragment
  if (lastIndex < message.length) {
    result.push({
      type: 'text',
      content: message.slice(lastIndex),
    })
  }

  return result
}
