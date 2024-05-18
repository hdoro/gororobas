import type { PropsWithChildren } from 'react'

export default function TwoColumnFields(props: PropsWithChildren) {
	return <div className="@md:grid-cols-2 grid gap-4">{props.children}</div>
}
