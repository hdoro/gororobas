'use client'

import { deleteNotesAction } from '@/actions/deleteNotes.action'
import Carrot from '@/components/icons/Carrot'
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
        title: 'Nota deletada',
      })
      router.push(paths.notesIndex())
      setStatus('success')
    } else {
      toast.toast({
        variant: 'destructive',
        title: 'Erro ao deletar a nota',
        description: 'Por favor, tente novamente.',
      })
      setStatus('idle')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild disabled={status === 'submitting'}>
        <Button mode="bleed" tone="destructive" size="xs" title="Deletar nota">
          <TrashIcon className="w-[1.25em]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" hasClose={status === 'idle'}>
        <DialogBody className="space-y-2 pt-10">
          {status === 'success' && (
            <>
              <DialogTitle asChild>
                <Text level="h2">Nota deletada</Text>
              </DialogTitle>
              <DialogDescription asChild>
                <Text level="p">
                  Te levando pra outras notas, vai que você se inspira a
                  escrever mais?
                </Text>
              </DialogDescription>
            </>
          )}
          {status === 'submitting' && (
            <DialogTitle asChild>
              <Text level="h2" className="flex items-center gap-3">
                <Carrot className="h-6 w-6 animate-spin" />
                Robôs trabalhando...
              </Text>
            </DialogTitle>
          )}
          {status === 'idle' && (
            <>
              <DialogTitle asChild>
                <Text level="h2">Deletar nota?</Text>
              </DialogTitle>
              <DialogDescription asChild>
                <Text level="p">
                  Essa ação é irreversível, você tem certeza que quer privar o
                  mundo da beleza das suas palavras e curiosidade?
                </Text>
              </DialogDescription>
              <div className="flex items-center gap-2 pt-2">
                <DialogClose asChild>
                  <Button mode="outline" tone="neutral" size="xs">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button tone="destructive" size="xs" onClick={deleteNote}>
                  Deletar
                </Button>
              </div>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
