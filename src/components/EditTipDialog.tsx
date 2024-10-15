'use client'

import { updateVegetableTipAction } from '@/actions/updateVegetableTip'
import type { VegetablePageData, VegetableTipCardData } from '@/queries'
import type { RichTextValue, VegetableTipInForm } from '@/schemas'
import { gender } from '@/utils/strings'
import { Edit2Icon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Carrot from './icons/Carrot'
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
  loading: () => (
    <div className="flex items-center justify-center gap-3 p-3 py-12">
      <Carrot className="h-6 w-6 animate-spin" />
      Carregando...
    </div>
  ),
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
          className="absolute right-1.5 top-1.5 text-muted-foreground"
        >
          <Edit2Icon className="w-[1.25em]" />
        </Button>
      </DialogTrigger>
      <DialogContent hasClose={false}>
        <DialogHeader>
          <DialogTitle>
            Enviar uma dica sobre{' '}
            {gender.preposition(vegetable.gender || 'NEUTRO')}{' '}
            {vegetable.names[0]}
          </DialogTitle>
        </DialogHeader>
        <VegetableTipForm
          onSubmit={async (data) => {
            return await updateVegetableTipAction({
              tip: { ...data, id: tip.id },
            })
          }}
          initialValue={initialValue}
          succesState={
            <div>
              <section className="mx-auto box-content px-pageX py-pageY text-center md:max-w-lg">
                <SparklesIcon
                  variant="color"
                  className="mb-3 inline-block w-12"
                />
                <Text level="h2" as="h2">
                  Dica atualizada!
                </Text>
                <div className="wrap mt-4 flex justify-center gap-2">
                  <DialogClose asChild>
                    <Button mode="outline" tone="neutral">
                      Continuar navegando
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
