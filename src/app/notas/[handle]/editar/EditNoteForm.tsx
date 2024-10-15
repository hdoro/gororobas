'use client'

import { updateNoteAction } from '@/actions/updateNote.action'
import type { NoteInForm } from '@/schemas'
import { getChangedObjectSubset, removeNullishKeys } from '@/utils/diffs'
import { paths } from '@/utils/urls'
import NoteForm from '@/components/NoteForm'

export default function EditNoteForm(props: {
  noteForDB: NoteInForm
  noteInForm: NoteInForm
}) {
  return (
    <NoteForm
      operation="edit"
      onSubmit={async (updatedNote) => {
        const currentNote = removeNullishKeys(props.noteForDB)
        const dataThatChanged = getChangedObjectSubset({
          prev: currentNote,
          next: updatedNote,
        })
        if (Object.keys(dataThatChanged).length === 0) {
          return {
            success: true,
            message: {
              title: 'Tudo certo, nada foi alterado',
              description: '',
            },
            redirectTo: paths.note(updatedNote.handle || ''),
          }
        }
        const response = await updateNoteAction({
          current: currentNote,
          updated: updatedNote,
        })
        if (response.success) {
          return {
            success: true,
            redirectTo: paths.note(response.result.handle),
          } as const
        }
        return { success: false, error: 'Failed to update note' } as const
      }}
      initialValue={props.noteInForm}
    />
  )
}
