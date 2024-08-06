import type { SourceCardData } from '@/queries'
import { ExternalLinkIcon } from 'lucide-react'
import ProfileCard from './ProfileCard'
import { Badge } from './ui/badge'
import { buttonVariants } from './ui/button'
import { Text } from './ui/text'

export default function SourceCard({ source }: { source: SourceCardData }) {
  if (source.type === 'GOROROBAS') {
    return (
      <>
        {source.users.map((user) => (
          <ProfileCard key={user.handle} profile={user} size="md" />
        ))}
      </>
    )
  }

  if (!source.credits) return null

  if (source.origin && URL.canParse(source.origin))
    return (
      <a
        href={source.origin as string}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({
          tone: 'neutral',
          size: 'lg',
          mode: 'outline',
          className: 'h-16 gap-4 px-4',
        })}
        title={source.credits}
      >
        <ExternalLinkIcon className="h-auto w-[2em] flex-[0_0_max-content]" />
        <div>
          <Text level="h3" as="p" className="max-w-[20ch] truncate font-normal">
            {source.credits}
          </Text>
          <Text level="sm" as="p" className="text-muted-foreground">
            {new URL(source.origin).origin}
          </Text>
        </div>
      </a>
    )

  return (
    <Badge className="space-y-2" variant="outline" title={source.credits}>
      <Text level="p" as="p" className="max-w-[30ch] truncate">
        {source.credits}
      </Text>

      {source.origin && (
        <Text level="sm" className="max-w-[35ch] truncate">
          {source.origin}
        </Text>
      )}
    </Badge>
  )
}
