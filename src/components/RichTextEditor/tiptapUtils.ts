import { type Editor, isNodeSelection, posToDOMRect } from '@tiptap/core'

/** Adapted from bubble menu plugin
 * https://github.com/ueberdosis/tiptap/blob/dac7fd2a0c39a5c2ebd3b94a536a4b6f99bf0b14/packages/extension-bubble-menu/src/bubble-menu-plugin.ts#L265-L282
 */
export function getEditorDomRect(editor: Editor) {
  const { selection } = editor.state

  if (isNodeSelection(selection)) {
    let node = editor.view.nodeDOM(selection.from) as HTMLElement

    if (node) {
      const nodeViewWrapper = node.dataset.nodeViewWrapper
        ? node
        : node.querySelector('[data-node-view-wrapper]')

      if (nodeViewWrapper) {
        node = nodeViewWrapper.firstChild as HTMLElement
      }

      if (node) {
        return node.getBoundingClientRect()
      }
    }
  }

  return posToDOMRect(editor.view, selection.from, selection.to)
}
