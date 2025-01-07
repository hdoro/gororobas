import { type Editor, type EditorEvents, isTextSelection } from '@tiptap/core'
import type { useMachine } from '@xstate/react'
import { createMachine } from 'xstate'
import { findMentionMatch } from './findSuggestionMatch'

/**
 * TODOS:
 * - Images
 * - (tiptapNodeHandlers) special rendering for links to other notes?
 * - other blocks?
 * - make FloatingUI popover more responsive to cursor position (esp. for BlockToolbar)
 */

type EditorEvent =
  // GENERIC
  | { type: 'BLUR' }
  | { type: 'FOCUS' }
  | { type: 'UPDATE'; data: EditorEvents['update'] }
  | {
      type: 'SELECTION_UPDATE'
      data: EditorEvents['selectionUpdate']
    }
  | { type: 'ESCAPE' }

  // FORMAT TOOLBAR
  | {
      type: 'EDIT_LINK'
    }

  // MENTIONS
  | {
      type: 'EDIT_MENTION'
    }

  // VIDEOS (YOUTUBE)
  | {
      type: 'EDIT_VIDEO'
    }

export const tiptapStateMachine = createMachine(
  {
    types: {} as {
      events: EditorEvent
    },
    id: 'editor',
    initial: 'idle',
    on: {
      SELECTION_UPDATE: {
        actions: ['updatePosition'],
      },
      BLUR: '.idle',
    },
    states: {
      idle: {
        on: {
          FOCUS: 'focused',
        },
      },
      focused: {
        on: {
          SELECTION_UPDATE: [
            {
              target: 'format',
              guard: 'isTextFormattable',
            },
            { target: 'mention', guard: 'isMentionTriggerable' },
          ],
          EDIT_MENTION: 'mention',
          EDIT_LINK: 'link',
          EDIT_VIDEO: 'video',
        },
      },
      format: {
        on: {
          SELECTION_UPDATE: [
            {
              // Stay in format if selection is still valid
              guard: 'isTextFormattable',
            },
            // Otherwise go back to mention or focused
            { target: 'mention', guard: 'isMentionTriggerable' },
            {
              target: 'focused',
            },
          ],
          ESCAPE: 'focused',
          EDIT_MENTION: {
            target: 'mention',
            actions: ['updatePosition', 'setQuery'],
          },
          // @TODO: need for a guard to ensure the editor can toggle the link?
          EDIT_LINK: 'link',
        },
      },
      link: {
        on: {
          ESCAPE: 'format',
        },
      },
      mention: {
        on: {
          ESCAPE: 'focused',
          SELECTION_UPDATE: [
            // Stay in mention if selection is still valid
            { guard: 'isMentionTriggerable' },
            // Otherwise go back to format or focused
            {
              target: 'format',
              guard: 'isTextFormattable',
            },
            {
              target: 'focused',
            },
          ],
        },
      },
      video: {
        on: {
          ESCAPE: 'focused',
        },
      },
    },
  },
  {
    guards: {
      /**
       * Adaptation of the bubble menu extension's `shouldShow`:
       * https://github.com/ueberdosis/tiptap/blob/develop/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L80-L106
       */
      isTextFormattable: ({ event }) => {
        if (event.type !== 'SELECTION_UPDATE') return false

        const { editor } = event.data
        const { doc, selection } = editor.state
        const { empty, from, to } = selection

        // Sometime check for `empty` is not enough.
        // Doubleclick an empty paragraph returns a node size of 2.
        // So we check also for an empty text size.
        const isEmptyTextBlock =
          !doc.textBetween(from, to).length && isTextSelection(selection)

        if (editor.isActive('link')) return true

        if (editor.isActive('video')) return false

        if (empty || isEmptyTextBlock || !editor.isEditable) {
          return false
        }

        return true
      },
      isMentionTriggerable: ({ event }) => {
        if (event.type !== 'SELECTION_UPDATE') return false

        const { editor } = event.data

        return !!findMentionMatch(editor.state.selection.$from)
      },
    },
  },
)

export type TiptapStateMachine = {
  state: ReturnType<typeof useMachine<typeof tiptapStateMachine>>[0]
  send: ReturnType<typeof useMachine<typeof tiptapStateMachine>>[1]
}

export type EditorUIProps = {
  editor: Editor
  editorId: string
  send: TiptapStateMachine['send']
  /** The offset to account for UI elements below the toolbar
   * Example: NoteForm has a fixed send footer
   */
  bottomOffset: number
}
