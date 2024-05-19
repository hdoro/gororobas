import type { NodeHandlers, NodeProps, NodeHandler } from './TipTapRender'

const TextRender: NodeHandler = (props: NodeProps) => {
	if (!props.node.text) {
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

	const links = props.node.marks?.filter((mark) => mark.type === 'link')

	if (links?.[0]) {
		return (
			<a
				href={links[0].attrs?.href}
				style={style}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary-700 underline font-medium"
			>
				{payload}
			</a>
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

	return (
		<>
			<p style={style}>{props.children}</p>
		</>
	)
}

const BulletList: NodeHandler = (props) => {
	return (
		<ul className="list-disc pl-[1em] space-y-[0.5em]">{props.children}</ul>
	)
}

const OrderedList: NodeHandler = (props) => {
	return (
		<ol className="list-decimal pl-[1em] space-y-[0.5em]">{props.children}</ol>
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
	doc: Passthrough,
	hardBreak: HardBreak,
	image: Image,
	bulletList: BulletList,
	orderedList: OrderedList,
	listItem: ListItem,
}
