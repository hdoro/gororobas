'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Text } from '@/components/ui/text'
import type { ResourceCardData } from '@/queries'
import { RESOURCE_FORMAT_TO_LABEL } from '@/utils/labels'
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
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'

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

// @TODO finish card
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

  // Get first 3 tags and count remaining ones
  const displayTags = resource.tags?.slice(0, 3) || []
  const remainingTagsCount = (resource.tags?.length || 0) - displayTags.length

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card
          className="group h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
          onClick={() => onClick?.(resource)}
        >
          <CardContent className="flex h-full flex-col p-4">
            {/* Format and thumbnail */}
            <div className="relative mb-3">
              {resource.thumbnail ? (
                <div className="mb-2 aspect-video w-full overflow-hidden rounded-md bg-stone-100">
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-2 flex aspect-video w-full items-center justify-center rounded-md bg-stone-100">
                  <FormatIcon size={40} className="text-stone-400" />
                </div>
              )}
              <Badge className="absolute top-2 right-2" variant="outline">
                <FormatIcon className="mr-1 size-[1em] opacity-80" />
                {label}
              </Badge>
            </div>

            <Text level="h3" as="h3" className="mb-2 line-clamp-2 font-medium">
              {resource.title}
            </Text>

            {resource.credit_line && (
              <Text level="sm" as="p" className="mb-2 text-stone-600">
                {resource.credit_line}
              </Text>
            )}

            {resource.description && (
              <DefaultTipTapRenderer content={resource.description} />
            )}

            {displayTags.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1">
                {displayTags.map((tag) => (
                  <Badge key={tag.handle} variant="outline" className="text-xs">
                    {tag.names[0]}
                  </Badge>
                ))}
                {remainingTagsCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{remainingTagsCount}
                  </Badge>
                )}
              </div>
            )}

            {(resource.related_to_vegetables?.length || 0) > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {resource.related_to_vegetables?.map((vegetable) => (
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
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <div className="p-4">
          <Text level="h2" as="h2" className="mb-4">
            {resource.title}
          </Text>

          {resource.credit_line && (
            <Text level="p" as="p" className="mb-4 text-stone-600">
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
          {(resource.related_to_vegetables?.length || 0) > 0 && (
            <div>
              <Text level="h3" as="h3" className="mb-2">
                Vegetais relacionados
              </Text>
              <div className="flex flex-wrap gap-1">
                {resource.related_to_vegetables?.map((vegetable) => (
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
  )
}
