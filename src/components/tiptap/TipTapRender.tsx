// Adapted from: https://github.com/troop-dev/tiptap-react-render/blob/main/src/tip-tap-render.tsx

import type { TiptapNode } from '@/types'

/**
 * Render a tip tap JSON node and all its children
 * @param {TipTapNode} node JSON node to render
 * @param {NodeHandlers} handlers a handler for each node type
 * @returns tree of components as react elements
 */
export function TipTapRender(props: {
	node: TiptapNode
	handlers: NodeHandlers
}): JSX.Element {
	const { node, handlers: mapping } = props
	// recursively render child content
	const children: JSX.Element[] = node.content
		? node.content.map((child, ix) => (
				<TipTapRender
					node={child}
					handlers={mapping}
					key={`${child.type}-${ix}`}
				/>
			))
		: []

	// return empty if we are missing a handler for this type
	if (!node.type || !(node.type in props.handlers)) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('Unhandled node', node)
		}
		return <></>
	}

	// render the handler for this type
	const Handler = mapping[node.type]
	return <Handler node={node}>{children}</Handler>
}

export interface NodeProps {
	children?: React.ReactNode
	node: TiptapNode
}

export type NodeHandler = (props: NodeProps) => JSX.Element

export interface NodeHandlers {
	readonly [attr: string]: NodeHandler
}
