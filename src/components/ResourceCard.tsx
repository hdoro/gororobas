'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Text } from '@/components/ui/text'
import type { ResourceFormat } from '@/gel.interfaces'
import type { ResourceCardData } from '@/queries'
import { cn } from '@/utils/cn'
import {
  RESOURCE_FORMAT_ACTION_LABELS,
  RESOURCE_FORMAT_TO_LABEL,
} from '@/utils/labels'
import { truncateTiptapContent } from '@/utils/tiptap'
import {
  BookOpen,
  Database,
  ExternalLinkIcon,
  File,
  FileText,
  FileVideo,
  FilmIcon,
  Globe,
  GraduationCap,
  Headphones,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { SanityImage } from './SanityImage'
import VegetableBadge from './VegetableChip'
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

const FORMAT_ICONS = {
  BOOK: BookOpen,
  FILM: FilmIcon,
  SOCIAL_MEDIA: Globe,
  VIDEO: FileVideo,
  ARTICLE: FileText,
  PODCAST: Headphones,
  COURSE: GraduationCap,
  ACADEMIC_WORK: FileText,
  DATASET: Database,
  ORGANIZATION: Globe,
  OTHER: File,
} as const satisfies Record<ResourceFormat, LucideIcon>

const DISPLAYED_TAGS = 2

export function FullResourceDisplay({
  resource,
  placement,
}: {
  resource: ResourceCardData
  placement: 'dialog' | 'standalone'
}) {
  const FormatIcon = FORMAT_ICONS[resource.format] || File
  const label = RESOURCE_FORMAT_TO_LABEL[resource.format] || 'Outro'

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2')}>
        {resource.thumbnail ? (
          <div className="size-20 overflow-hidden rounded-md bg-stone-100">
            <SanityImage
              image={resource.thumbnail}
              maxWidth={250}
              className={
                'block h-full w-full object-contain transition-all! select-none group-hover:scale-105'
              }
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex size-20 items-center justify-center rounded-md bg-stone-100">
            <FormatIcon className="text-primary-300 size-[40%]" />
          </div>
        )}
        <div className="flex-[1_0_250px] space-y-1">
          <div className="flex items-center gap-2">
            <FormatIcon size={16} />
            <Text level="sm">{label}</Text>
          </div>
          {placement === 'dialog' ? (
            <DialogTitle asChild>
              <Text level="h2" as="h2">
                {resource.title}
              </Text>
            </DialogTitle>
          ) : (
            <Text level="h2" as="h2">
              {resource.title}
            </Text>
          )}
          {resource.credit_line && (
            <Text level="p" as="p" className="text-muted-foreground">
              {resource.credit_line}
            </Text>
          )}
        </div>
        {resource.url && (
          <Button asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="size-[1.25em]" />
              <Text level="sm">
                {RESOURCE_FORMAT_ACTION_LABELS[resource.format]}
              </Text>
            </a>
          </Button>
        )}
      </div>

      {((resource.related_vegetables?.length || 0) > 0 ||
        (resource.tags?.length || 0) > 0) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-2 gap-y-3">
          {(resource.tags?.length || 0) > 0 && (
            <div className="flex max-w-2xl flex-wrap gap-1">
              {resource.tags?.map((tag) => (
                <Badge key={tag.handle} size="sm">
                  {tag.names[0]}
                </Badge>
              ))}
            </div>
          )}

          {(resource.related_vegetables?.length || 0) > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              <Text level="sm" as="h2" weight="semibold">
                {resource.related_vegetables.length > 1
                  ? 'Vegetais relacionados'
                  : 'Vegetal relacionado'}
              </Text>
              {resource.related_vegetables?.map((vegetable) => (
                <VegetableBadge
                  key={vegetable.handle}
                  vegetable={vegetable}
                  size="sm"
                  includeName
                />
              ))}
            </div>
          )}
        </div>
      )}

      {resource.description && (
        <div className="note-card--content mt-5 max-w-2xl space-y-3">
          <DefaultTipTapRenderer content={resource.description} />
        </div>
      )}
    </>
  )
}

export default function ResourceCard({
  resource,
}: {
  resource: ResourceCardData
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const FormatIcon = FORMAT_ICONS[resource.format] || File
  const label = RESOURCE_FORMAT_TO_LABEL[resource.format] || 'Outro'

  const displayTags = resource.tags?.slice(0, DISPLAYED_TAGS) || []
  const remainingTagsCount = (resource.tags?.length || 0) - displayTags.length

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-1 md:px-1">
        {/* Format and thumbnail */}
        <div className="relative mb-3">
          {resource.thumbnail ? (
            <div className="mb-2 aspect-video w-full overflow-hidden rounded-md bg-stone-100 p-4">
              <SanityImage
                image={resource.thumbnail}
                maxWidth={250}
                className={
                  'block h-full w-full object-contain transition-all! select-none group-hover:scale-105'
                }
                draggable={false}
              />
            </div>
          ) : (
            <div className="mb-2 flex aspect-video w-full items-center justify-center rounded-md bg-stone-100">
              <FormatIcon className="text-primary-300 size-10" />
            </div>
          )}
          <Badge className="absolute top-2 right-2" variant="outline" size="sm">
            <FormatIcon className="mr-1 size-[1em] opacity-80" />
            {label}
          </Badge>
        </div>

        <div className="mx-2">
          {(resource.related_vegetables?.length || 0) > 0 && (
            <TooltipProvider delayDuration={200}>
              <div
                className={cn(
                  'hide-scrollbar -mx-3 mt-2 flex overflow-auto px-3',
                  resource.related_vegetables.length <= 2
                    ? 'gap-3'
                    : '-space-x-3',
                )}
              >
                {resource.related_vegetables.map((vegetable) => (
                  <VegetableBadge
                    key={vegetable.handle}
                    vegetable={vegetable}
                    size="sm"
                    includeName={resource.related_vegetables.length <= 2}
                  />
                ))}
              </div>
            </TooltipProvider>
          )}

          <Text level="h3" as="h3" className="line-clamp-2 font-medium">
            {resource.title}
          </Text>

          {resource.credit_line && (
            <Text level="sm" as="p" className="text-muted-foreground">
              {resource.credit_line}
            </Text>
          )}

          {displayTags.length > 0 && (
            <div className="hide-scrollbar -mx-3 mt-2 flex gap-1 overflow-auto px-3">
              {displayTags.map((tag) => (
                <Badge key={tag.handle} variant="default" size="sm">
                  {tag.names[0]}
                </Badge>
              ))}
              {remainingTagsCount > 0 && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        size="sm"
                        className="relative z-20 cursor-context-menu"
                      >
                        +{remainingTagsCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="flex max-w-xs flex-wrap gap-2"
                    >
                      {resource.tags?.slice(DISPLAYED_TAGS).map((tag) => (
                        <Badge key={tag.handle} variant="default" size="sm">
                          {tag.names[0]}
                        </Badge>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {resource.description && (
            <div className="mt-3 line-clamp-3">
              <DefaultTipTapRenderer
                content={truncateTiptapContent(resource.description, 1)}
              />
            </div>
          )}
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="absolute inset-0 z-10 cursor-pointer">
          <span className="sr-only">
            Mais informação sobre {resource.title}
          </span>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-var(--page-padding-x))] overflow-y-auto md:max-w-3xl">
          <div className="p-4">
            <FullResourceDisplay resource={resource} placement="dialog" />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
