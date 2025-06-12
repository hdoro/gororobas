'use client'

import { deleteNotesAction } from '@/actions/deleteNotes.action'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import { m } from '@/paraglide/messages'
import { paths } from '@/utils/urls'
import { TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const router = useRouter()
  const toast = useToast()

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  )

  async function deleteNote() {
    setStatus('submitting')
    const response = await deleteNotesAction([noteId])
    if (response === true) {
      toast.toast({
        variant: 'default',
        title: m.dark_these_gopher_enjoy(),
      })
      router.push(paths.notesIndex())
      setStatus('success')
    } else {
      toast.toast({
        variant: 'destructive',
        title: m.topical_neat_squid_mend(),
        description: m.cool_mealy_slug_offer(),
      })
      setStatus('idle')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild disabled={status === 'submitting'}>
        <Button
          mode="bleed"
          tone="destructive"
          size="xs"
          title={m.less_alert_larva_stir()}
        >
          <TrashIcon className="w-[1.25em]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" hasClose={status === 'idle'}>
        <DialogBody className="space-y-2 pt-10">
          {status === 'success' && (
            <>
              <DialogTitle asChild>
                <Text level="h2">{m.aloof_heroic_weasel_spin()}</Text>
              </DialogTitle>
              <DialogDescription asChild>
                <Text level="p">{m.grand_due_squirrel_fall()}</Text>
              </DialogDescription>
            </>
          )}
          {status === 'submitting' && (
            <DialogTitle>
              <LoadingSpinner />
            </DialogTitle>
          )}
          {status === 'idle' && (
            <>
              <DialogTitle asChild>
                <Text level="h2">{m.less_alert_larva_stir()}</Text>
              </DialogTitle>
              <DialogDescription asChild>
                <Text level="p">{m.tidy_good_racoon_hush()}</Text>
              </DialogDescription>
              <div className="flex items-center gap-2 pt-2">
                <DialogClose asChild>
                  <Button mode="outline" tone="neutral" size="xs">
                    {m.cancel()}
                  </Button>
                </DialogClose>
                <Button tone="destructive" size="xs" onClick={deleteNote}>
                  {m.delete()}
                </Button>
              </div>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
