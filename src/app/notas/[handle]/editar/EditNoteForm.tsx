'use client'

import { updateNoteAction } from '@/actions/updateNote.action'
import NoteForm from '@/components/NoteForm'
import { m } from '@/paraglide/messages'
import type { NoteInForm } from '@/schemas'
import { getChangedObjectSubset, removeNullishKeys } from '@/utils/diffs'
import { paths } from '@/utils/urls'

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
              title: m.aloof_deft_elephant_accept(),
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
        return { success: false, error: m.tame_zany_giraffe_amaze() } as const
      }}
      initialValue={props.noteInForm}
    />
  )
}
