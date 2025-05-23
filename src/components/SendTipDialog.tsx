'use client'

import { createVegetableTipAction } from '@/actions/createVegetableTip'
import { m } from '@/paraglide/messages'
import type { VegetablePageData } from '@/queries'
import { generateId } from '@/utils/ids'
import { paths } from '@/utils/urls'
import { MessageSquarePlus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Text } from './ui/text'

const VegetableTipForm = dynamic(() => import('./VegetableTipForm'), {
  loading: () => <LoadingSpinner />,
})

export function SendTipDialog({ vegetable }: { vegetable: VegetablePageData }) {
  const pathname = usePathname()
  const [rerenderFormKey, setRerenderFormKey] = useState<null | string>(null)
  const { current_user_id } = vegetable

  // By using a key, we force the form to re-mount when the key changes
  function resetForm() {
    setRerenderFormKey(generateId())
  }

  if (!current_user_id) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button mode="outline">
            <MessageSquarePlus className="w-[1.25em]" />{' '}
            {m.few_chunky_earthworm_nail()}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogBody className="space-y-2 pt-10">
            <DialogTitle asChild>
              <Text level="h2">{m.busy_level_trout_pout()}</Text>
            </DialogTitle>
            <DialogDescription asChild>
              <Text level="p">{m.last_fancy_jay_comfort()}</Text>
            </DialogDescription>
            <div className="flex items-center gap-2 pt-2">
              <Button asChild>
                <a href={paths.signInOrSignUp(pathname)}>
                  {m.next_that_iguana_charm()}
                </a>
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button mode="outline">
          <MessageSquarePlus className="w-[1.25em]" />{' '}
          {m.extra_moving_warthog_twirl()}
        </Button>
      </DialogTrigger>
      <DialogContent
        hasClose={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {m.polite_vivid_koala_relish({
              gender: vegetable.gender || 'NEUTRO',
              name: vegetable.names[0],
            })}
          </DialogTitle>
        </DialogHeader>
        <VegetableTipForm
          key={rerenderFormKey}
          operation="create"
          onSubmit={async (data) => {
            return await createVegetableTipAction({
              tip: data,
              vegetable_id: vegetable.id,
            })
          }}
          initialValue={{
            sources: [
              {
                id: generateId(),
                type: 'GOROROBAS',
                userIds: [current_user_id],
              },
            ],
          }}
          succesState={
            <div>
              <section className="px-pageX py-pageY mx-auto box-content text-center md:max-w-lg">
                <SparklesIcon
                  variant="color"
                  className="mb-3 inline-block w-12"
                />
                <Text level="h2" as="h2">
                  {m.born_sleek_beaver_pout()}
                </Text>
                <Text>{m.fit_elegant_eagle_fear()}</Text>
                <div className="wrap mt-4 flex justify-center gap-2">
                  <DialogClose asChild>
                    <Button mode="outline" tone="neutral">
                      {m.spare_cool_wasp_feast()}
                    </Button>
                  </DialogClose>
                  <Button mode="outline" tone="primary" onClick={resetForm}>
                    {m.acidic_few_jackdaw_harbor()}
                  </Button>
                </div>
              </section>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
