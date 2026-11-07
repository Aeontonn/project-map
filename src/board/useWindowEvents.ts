import { useEffect } from 'react'

// If you miss a card when dropping an image, the browser would normally open the
// file and replace the whole app. Cancelling these two events everywhere stops that.
export function useBlockFileDrop() {
  useEffect(() => {
    const block = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])
}

// Keyboard shortcuts for the whole board:
// - Ctrl+K (Cmd+K on Mac) opens the jump box
// - Delete/Backspace removes selected LINES. Cards are never deleted by a key
//   (only from their dialog), so a stray key press can't wipe out a project.
export function useShortcuts({ onJump, onDeleteLines }: { onJump: () => void; onDeleteLines: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onJump()
      }
      const typing = (e.target as HTMLElement).closest('input, textarea')
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing) onDeleteLines()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onJump, onDeleteLines])
}
