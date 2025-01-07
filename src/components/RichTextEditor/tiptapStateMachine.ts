import { type EditorEvents, isTextSelection } from '@tiptap/core'
import type { useMachine } from '@xstate/react'
import { createMachine } from 'xstate'

/**
 * TODOS:
 *
 * - simplify focused/blur logic
 *    - Especially the part on ignoring link & video state
 *    - perhaps move into state machine?
 * - further tests on blur mechanism
 * - finish mentions
 *    - open list on `@` and update the query
 *     - when list opened via button, have query input inside list instead of in the editor
 *     - handle up/down arrows and enter key
 *     - consider using shadcn's drawer instead than fixed div on mobile
 * - links in BlocksToolbar makes sense? Perhaps adding an URL from scratch, but that's not very useful...
 * - Images
 * - other blocks?
 * - special rendering for links to other notes?
 * - consider moving more logic into the state machine for centralization & clarity
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
          SELECTION_UPDATE: {
            target: 'format',
            guard: 'isTextFormattable',
          },
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
            {
              // Otherwise go back to idle
              target: 'focused',
            },
          ],
          ESCAPE: 'focused',
          EDIT_MENTION: {
            target: 'mention',
            actions: ['updatePosition', 'setQuery'],
          },
          // @TODO: need for a guard?
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

        if (empty || isEmptyTextBlock || !editor.isEditable) {
          return false
        }

        return true
      },
    },
  },
)

export type TiptapStateMachine = {
  state: ReturnType<typeof useMachine<typeof tiptapStateMachine>>[0]
  send: ReturnType<typeof useMachine<typeof tiptapStateMachine>>[1]
}
