import { BASE_URL } from '@/utils/config'
import Link from 'next/link'
import { Children } from 'react'
import type { NodeHandler, NodeHandlers, NodeProps } from './TipTapRender'

const TextRender: NodeHandler = (props: NodeProps) => {
  if (!props.node.text) {
    return <></>
  }

  // Hacky way of hiding invalid content 😅
  if (
    URL.canParse(props.node.text.trim()) &&
    new URL(props.node.text.trim()).host === 'photos.google.com'
  ) {
    return <></>
  }

  const payload: string = props.node.text

  // biome-ignore lint: we're modifying `style`
  let style: React.CSSProperties = {}

  props.node.marks?.forEach((mark) => {
    switch (mark.type) {
      case 'bold':
        style.fontWeight = 'bold'
        break
      case 'italic':
        style.fontStyle = 'italic'
        break
      case 'underline':
        style.textDecorationLine = 'underline'
        break
      case 'textStyle':
        if (mark.attrs?.color) {
          style.color = mark.attrs.color
        }
        break
      case 'strike':
        style.textDecorationLine = 'line-through'
        break
      case 'link':
        break
      default:
    }
  })

  const link = props.node.marks?.find((mark) => mark.type === 'link')

  if (typeof link?.attrs?.href === 'string') {
    const href = link.attrs.href

    const isInternal = href.startsWith(BASE_URL)
    const Comp = isInternal ? Link : 'a'
    return (
      <Comp
        href={href}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary-700 underline"
      >
        {payload}
      </Comp>
    )
  }

  return <span style={style}>{payload}</span>
}

const Paragraph: NodeHandler = (props) => {
  // biome-ignore lint: we're modifying `style`
  let style: React.CSSProperties = {}

  if (props.node.attrs) {
    const attrs = props.node.attrs

    if (attrs.textAlign) {
      style.textAlign = attrs.textAlign
    }
  }

  const isEmpty = !props.children || Children.count(props.children) === 0
  return (
    <p style={style} className={isEmpty ? 'p-empty' : undefined}>
      {props.children}
    </p>
  )
}

const LEVEL_TO_TAG = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

const Heading: NodeHandler = (props) => {
  // biome-ignore lint: we're modifying `style`
  let style: React.CSSProperties = {}

  if (props.node.attrs) {
    const attrs = props.node.attrs

    if (attrs.textAlign) {
      style.textAlign = attrs.textAlign
    }
  }

  const Component =
    LEVEL_TO_TAG[(props.node.attrs?.level as keyof typeof LEVEL_TO_TAG) || 1] ||
    'p'

  return <Component style={style}>{props.children}</Component>
}

const BulletList: NodeHandler = (props) => {
  return (
    <ul className="list-disc space-y-[0.5em] pl-[1em]">{props.children}</ul>
  )
}

const OrderedList: NodeHandler = (props) => {
  return (
    <ol className="list-decimal space-y-[0.5em] pl-[1em]">{props.children}</ol>
  )
}

const ListItem: NodeHandler = (props) => {
  return <li>{props.children}</li>
}

const HardBreak: NodeHandler = (props) => {
  return <br />
}

const Passthrough: NodeHandler = (props) => {
  return <>{props.children}</>
}

const Image: NodeHandler = (props) => {
  const attrs = props.node.attrs
  return <img alt={attrs?.alt} src={attrs?.src} title={attrs?.title} />
}

export const tiptapNodeHandlers: NodeHandlers = {
  text: TextRender,
  paragraph: Paragraph,
  heading: Heading,
  doc: Passthrough,
  hardBreak: HardBreak,
  image: Image,
  bulletList: BulletList,
  orderedList: OrderedList,
  listItem: ListItem,
}
