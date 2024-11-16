'use client'

import Link from 'next/link'
import type {
  ComponentProps,
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from 'react'

export default function ProfileCardLink({
  asLink,
  children,
  ...props
}: PropsWithChildren<
  { asLink: boolean } & (
    | ComponentProps<typeof Link>
    | DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  )
>) {
  const RootComponent = asLink ? Link : 'div'
  return (
    // @ts-expect-error href is only needed when using Link
    <RootComponent
      {...props}
      onClick={(e) => {
        // (for ProfileCard) Prevent the card from flipping
        e.stopPropagation()
      }}
    >
      {children}
    </RootComponent>
  )
}
