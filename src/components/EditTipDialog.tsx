'use client'

import { updateVegetableTipAction } from '@/actions/updateVegetableTip'
import { m } from '@/paraglide/messages'
import type { VegetablePageData, VegetableTipCardData } from '@/queries'
import type { RichTextValue, VegetableTipInForm } from '@/schemas'
import { Edit2Icon } from 'lucide-react'
import dynamic from 'next/dynamic'
import LoadingSpinner from './LoadingSpinner'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Text } from './ui/text'

const VegetableTipForm = dynamic(() => import('./VegetableTipForm'), {
  loading: () => <LoadingSpinner />,
})

export function EditTipDialog({
  vegetable,
  tip,
}: {
  vegetable: VegetablePageData
  tip: VegetableTipCardData
}) {
  const initialValue: VegetableTipInForm = {
    id: tip.id,
    handle: tip.handle,
    content: tip.content as RichTextValue,
    sources: tip.sources.map((source) => {
      if (source.type === 'EXTERNAL') {
        return {
          id: source.id,
          type: source.type,
          credits: source.credits || '',
          origin: source.origin,
          comments: source.comments as RichTextValue | null,
        }
      }

      return {
        id: source.id,
        type: source.type,
        userIds: source.users.map((user) => user.id) as [string, ...string[]],
        comments: source.comments as RichTextValue | null,
      }
    }),
    subjects: tip.subjects,
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          mode="bleed"
          title="Editar dica"
          size="icon"
          tone="neutral"
          className="text-muted-foreground absolute top-1.5 right-1.5"
        >
          <Edit2Icon className="w-[1.25em]" />
        </Button>
      </DialogTrigger>
      <DialogContent
        hasClose={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {m.mushy_due_beaver_shine({
              name: vegetable.names[0],
              gender: vegetable.gender || 'NEUTRO',
            })}
          </DialogTitle>
        </DialogHeader>
        <VegetableTipForm
          onSubmit={async (data) => {
            return await updateVegetableTipAction({
              tip: { ...data, id: tip.id },
            })
          }}
          operation="edit"
          initialValue={initialValue}
          succesState={
            <div>
              <section className="px-pageX py-pageY mx-auto box-content text-center md:max-w-lg">
                <SparklesIcon
                  variant="color"
                  className="mb-3 inline-block w-12"
                />
                <Text level="h2" as="h2">
                  {m.new_spry_llama_harbor()}
                </Text>
                <div className="wrap mt-4 flex justify-center gap-2">
                  <DialogClose asChild>
                    <Button mode="outline" tone="neutral">
                      {m.topical_red_mantis_enchant()}
                    </Button>
                  </DialogClose>
                </div>
              </section>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
