'use client'

import NextLink, { useLinkStatus } from 'next/link'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

const RouteTransitionContext = createContext<{
  setNavigationActive: (active: boolean) => void
}>({
  setNavigationActive: () => {},
})

export function RouteTransitionProvider(props: PropsWithChildren) {
  const [navigationActive, setNavigationActive] = useState(false)
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    if (!ref.current) return

    if (navigationActive) ref.current.start()
    else ref.current.complete()
  }, [navigationActive])

  return (
    <RouteTransitionContext.Provider value={{ setNavigationActive }}>
      <LoadingBar ref={ref} color="#FF785A" height={4} shadow={false} />
      {props.children}
    </RouteTransitionContext.Provider>
  )
}

/** Enhanced link that includes a route transition animation */
// @ts-expect-error
const Link: typeof NextLink = (props) => {
  return (
    <NextLink onNavigate={() => {}} {...props}>
      {props.children}
      <LinkPendingStatus />
    </NextLink>
  )
}

export default Link

function LinkPendingStatus() {
  // As there are potentially hundreds of links at a time, and all but one will be not pending,
  // we can't `setNavigationActive(false)` whenever `pending === false`. To solve this, we keep
  // track whether the current link has notified the context or not.
  const [hasNotified, setHasNotified] = useState(false)
  const { pending } = useLinkStatus()
  const { setNavigationActive } = useContext(RouteTransitionContext)

  // biome-ignore lint: We only want to react to changes in the pending state
  useEffect(() => {
    if (pending) {
      setNavigationActive(true)
      setHasNotified(true)
    }

    if (hasNotified && !pending) {
      setNavigationActive(false)
      setHasNotified(false)
    }

    return () => {
      // If the link is unmounted while pending, complete the loading bar
      if (pending) setNavigationActive(false)
    }
  }, [pending])

  return null
}
