import type { PropsWithChildren } from 'react'

export default function TwoColumnFields(props: PropsWithChildren) {
  return <div className="grid gap-4 @md:grid-cols-2">{props.children}</div>
}
