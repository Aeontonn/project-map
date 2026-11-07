import type { ReactNode } from 'react'

type Props = {
  title: string
  onSubmit: () => void
  onClose: () => void
  onDelete?: () => void // leave out to hide the delete button (e.g. when adding something new)
  deleteLabel?: string
  onPaste?: (e: React.ClipboardEvent) => void
  children: ReactNode // the form fields, whatever you put between <Dialog> and </Dialog>
}

// The frame every popup shares: dark background, white box, title, and the
// Delete / Cancel / Save buttons. Each dialog only fills in its own fields.
export default function Dialog({ title, onSubmit, onClose, onDelete, deleteLabel = 'Delete', onPaste, children }: Props) {
  return (
    // Clicking the dark background closes the popup...
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="dialog"
        // A <form> reloads the page on submit by default; preventDefault stops that
        onSubmit={(e) => { e.preventDefault(); onSubmit() }}
        onPaste={onPaste}
        // ...but clicks inside the box shouldn't reach the background
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>
        {children}
        <div className="dialog-actions">
          {onDelete && <button type="button" className="danger" onClick={onDelete}>{deleteLabel}</button>}
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
