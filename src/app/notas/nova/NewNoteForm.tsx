'use client'

import { createNotesAction } from '@/actions/createNotes.action'
import { paths } from '@/utils/urls'
import NoteForm from '@/components/NoteForm'

export default function NewNoteForm() {
  return (
    <NoteForm
      operation="create"
      onSubmit={async (note) => {
        const response = await createNotesAction([note])
        if (response.success && response.result[0]?.handle) {
          return {
            success: true,
            redirectTo: paths.note(response.result[0].handle),
          } as const
        }
        return { success: false, error: 'Failed to create note' } as const
      }}
    />
  )
}
