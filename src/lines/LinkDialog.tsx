import { useState } from 'react'
import Dialog from '../ui/Dialog'

type Props = {
  initial: string
  onSave: (label: string) => void
  onDelete: () => void
  onClose: () => void
}

// Popup for a line between two cards: give it a label, or delete it
export default function LinkDialog({ initial, onSave, onDelete, onClose }: Props) {
  const [label, setLabel] = useState(initial)

  return (
    <Dialog title="Line" onSubmit={() => onSave(label.trim())} onClose={onClose} onDelete={onDelete} deleteLabel="Delete line">
      <label>Label (optional)</label>
      <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="uses, same API, inspired by…" />
    </Dialog>
  )
}
