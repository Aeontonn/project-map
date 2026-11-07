import { useState } from 'react'

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
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="dialog"
        onSubmit={(e) => { e.preventDefault(); onSave(label.trim()) }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2>Line</h2>
        <label>Label (optional)</label>
        <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="uses, same API, inspired by…" />

        <div className="dialog-actions">
          <button type="button" className="danger" onClick={onDelete}>Delete line</button>
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
