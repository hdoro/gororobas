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
import type { ResourceCardData } from '@/queries'
import { RESOURCE_FORMAT_TO_LABEL } from '@/utils/labels'
import { truncateTiptapContent } from '@/utils/tiptap'
import {
  BookOpen,
  Database,
  File,
  FileText,
  FileVideo,
  Globe,
  GraduationCap,
  Headphones,
} from 'lucide-react'
import { useState } from 'react'
import { SanityImage } from './SanityImage'
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

const FORMAT_ICONS = {
  BOOK: BookOpen,
  SOCIAL_MEDIA: Globe,
  VIDEO: FileVideo,
  ARTICLE: FileText,
  PODCAST: Headphones,
  COURSE: GraduationCap,
  ACADEMIC_WORK: FileText,
  DATASET: Database,
  ORGANIZATION: Globe,
  OTHER: File,
}

const DISPLAYED_TAGS = 2

// @TODO finish dialog
export default function ResourceCard({
  resource,
  onClick,
}: {
  resource: ResourceCardData
  onClick?: ((resource: ResourceCardData) => void) | undefined
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const FormatIcon = FORMAT_ICONS[resource.format] || File
  const label = RESOURCE_FORMAT_TO_LABEL[resource.format] || 'Outro'

  const displayTags = resource.tags?.slice(0, DISPLAYED_TAGS) || []
  const remainingTagsCount = (resource.tags?.length || 0) - displayTags.length

  return (
    <Card
      className="group relative overflow-hidden"
      onClick={() => onClick?.(resource)}
    >
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

          {(resource.related_vegetables?.length || 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {resource.related_vegetables?.map((vegetable) => (
                <Badge
                  key={vegetable.handle}
                  variant="outline"
                  className="text-xs"
                >
                  {vegetable.name}
                </Badge>
              ))}
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
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <div className="p-4">
            <DialogTitle asChild>
              <Text level="h2" as="h2" className="mb-4">
                {resource.title}
              </Text>
            </DialogTitle>

            {resource.credit_line && (
              <Text level="p" as="p" className="text-muted-foreground mb-4">
                {resource.credit_line}
              </Text>
            )}

            {/* Format badge */}
            <div className="mb-4 flex items-center gap-2">
              <FormatIcon size={16} />
              <Text level="sm">{label}</Text>
            </div>

            {/* URL */}
            {resource.url && (
              <div className="mb-4">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <Globe size={16} />
                  <Text level="sm">Acessar recurso</Text>
                </a>
              </div>
            )}

            {/* Full description */}
            {resource.description && (
              <div className="mb-4">
                <Text level="h3" as="h3" className="mb-2">
                  Descrição
                </Text>
                <DefaultTipTapRenderer content={resource.description} />
              </div>
            )}

            {/* Tags */}
            {(resource.tags?.length || 0) > 0 && (
              <div className="mb-4">
                <Text level="h3" as="h3" className="mb-2">
                  Tags
                </Text>
                <div className="flex flex-wrap gap-1">
                  {resource.tags?.map((tag) => (
                    <Badge key={tag.handle} variant="outline">
                      {tag.names[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related vegetables */}
            {(resource.related_vegetables?.length || 0) > 0 && (
              <div>
                <Text level="h3" as="h3" className="mb-2">
                  Vegetais relacionados
                </Text>
                <div className="flex flex-wrap gap-1">
                  {resource.related_vegetables?.map((vegetable) => (
                    <Badge key={vegetable.handle} variant="outline">
                      {vegetable.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
